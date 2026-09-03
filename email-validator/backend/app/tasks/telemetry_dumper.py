#!/usr/bin/env python3
# ==============================================================================
# BRIDGE Modul X - Automated Monthly Telemetry Dumper & Cold Archiver
# ==============================================================================
# This utility queries the Supabase PostgreSQL database for historical validation
# results older than 30 days, writes them to structured CSVs, compresses them
# using gzip, and optionally uploads them to S3/Supabase Storage before safely 
# pruning them from the live transaction tables [106, 111].
# ==============================================================================

import os
import sys
import csv
import gzip
import shutil
import asyncio
from datetime import datetime, timedelta
import structlog

# Set up clean structured logging
logger = structlog.get_logger("telemetry_dumper")

# Attempt importing backend database engine and config
try:
    from database import AsyncSessionLocal, settings
    from sqlalchemy.sql import text
except ImportError:
    # Standalone mock configurations for isolated orchestration/testing
    class MockSettings:
        ENABLE_DB_PERSISTENCE = True
        # Read from environment variables if present
        DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://emailval:emailval123@localhost:5432/emailval_db")
        AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
        AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
        S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "modulx-telemetry-cold-storage")
        S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL", "") # e.g. for MinIO or custom S3-compatible endpoints
    settings = MockSettings()
    
    # Simple Async Session Mock fallback
    AsyncSessionLocal = None

# S3 Client instantiation check
s3_client = None
if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
    try:
        import boto3
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            endpoint_url=settings.S3_ENDPOINT_URL if settings.S3_ENDPOINT_URL else None
        )
        logger.info("Cold storage S3 client initialized successfully.")
    except ImportError:
        logger.warning("boto3 package missing. Local filesystem archive mode only.")

# Configuration Directories (env-overridable; defaults to a local ./backup folder)
BACKUP_DIR = os.getenv("TELEMETRY_BACKUP_DIR", os.path.join(os.getcwd(), "backup", "telemetry"))


async def execute_monthly_dump(dry_run: bool = False):
    """
    Finds validation records older than 30 days, exports them to compressed gzipped CSV,
    uploads to cold storage, and prunes from live tables [106].
    """
    logger.info("Initializing monthly database telemetry archive lifecycle...")

    if AsyncSessionLocal is None:
        logger.error("Database connections not loaded. Aborting telemetry dump.")
        return False

    os.makedirs(BACKUP_DIR, exist_ok=True)

    # Define time thresholds
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    month_slug = thirty_days_ago.strftime("%Y-%m")
    
    filename = f"modulx_telemetry_{month_slug}.csv"
    csv_filepath = os.path.join(BACKUP_DIR, filename)
    archive_filepath = f"{csv_filepath}.gz"

    # 1. Query records from Supabase validation_results
    fetch_query = """
        SELECT id, email, status, score, risk_level, syntax_passed, 
               domain_exists, has_mx_records, is_disposable, is_catch_all, 
               smtp_verified, validated_at
        FROM validation_results
        WHERE validated_at < :cutoff_date
        ORDER BY validated_at ASC;
    """

    count_query = "SELECT COUNT(*) FROM validation_results WHERE validated_at < :cutoff_date;"

    try:
        async with AsyncSessionLocal() as session:
            # Check if records exist
            total_records_result = await session.execute(text(count_query), {"cutoff_date": thirty_days_ago})
            total_records = total_records_result.scalar() or 0

            if total_records == 0:
                logger.info("No records found older than 30 days. No archival dump required.")
                return True

            logger.info("Discovered historical logs to archive.", record_count=total_records, cutoff=thirty_days_ago.isoformat())

            # Export data in chunks to handle high volumes without memory starvation
            limit = 5000
            offset = 0
            
            with open(csv_filepath, mode='w', newline='', encoding='utf-8') as csv_file:
                writer = csv.writer(csv_file)
                # Write CSV Header
                writer.writerow([
                    "id", "email", "status", "score", "risk_level", "syntax_passed",
                    "domain_exists", "has_mx_records", "is_disposable", "is_catch_all",
                    "smtp_verified", "validated_at"
                ])

                while offset < total_records:
                    chunk_query = text(f"{fetch_query} LIMIT {limit} OFFSET {offset};")
                    result = await session.execute(chunk_query, {"cutoff_date": thirty_days_ago})
                    rows = result.fetchall()
                    
                    for r in rows:
                        writer.writerow([
                            str(r[0]), r[1], r[2], r[3], r[4], bool(r[5]),
                            bool(r[6]), bool(r[7]), bool(r[8]), bool(r[9]),
                            bool(r[10]), r[11].isoformat() if r[11] else ""
                        ])
                    
                    offset += limit
                    logger.debug("Exported chunk progress.", offset=offset, total=total_records)

            logger.info("CSV generation completed successfully. Compressing file...", path=csv_filepath)

            # 2. Compress the exported CSV file using Gzip (cold-storage standard)
            with open(csv_filepath, 'rb') as f_in:
                with gzip.open(archive_filepath, 'wb', compresslevel=9) as f_out:
                    shutil.copyfileobj(f_in, f_out)

            # Clean up the raw uncompressed CSV
            os.remove(csv_filepath)
            logger.info("Telemetry archive compressed successfully.", compressed_path=archive_filepath)

            # 3. Upload archive to S3 Cold Storage if client is configured
            upload_success = False
            if s3_client and not dry_run:
                s3_key = f"archives/{month_slug}/{filename}.gz"
                logger.info("Uploading compressed archive to AWS S3 / Supabase bucket...", bucket=settings.S3_BUCKET_NAME, s3_key=s3_key)
                try:
                    s3_client.upload_file(archive_filepath, settings.S3_BUCKET_NAME, s3_key)
                    logger.info("Upload to AWS S3 completed successfully.")
                    upload_success = True
                except Exception as s3_err:
                    logger.error("AWS S3 / Supabase bucket upload failed.", error=str(s3_err))
            else:
                logger.info("Archival file saved to local persistent disk volume.", path=archive_filepath)
                upload_success = True

            # 4. Safe Pruning from live database tables (Only if archive/upload succeeds)
            if upload_success and not dry_run:
                logger.info("Pruning archived rows from validation_results table...")
                prune_query = """
                    DELETE FROM validation_results
                    WHERE validated_at < :cutoff_date;
                """
                async with session.begin():
                    prune_result = await session.execute(text(prune_query), {"cutoff_date": thirty_days_ago})
                    rows_deleted = prune_result.rowcount
                    logger.info("Pruning cycle completed.", pruned_rows_count=rows_deleted)

            logger.info("Monthly telemetry backup lifecycle successfully finished.")
            return True

    except Exception as e:
        logger.error("Critical exception occurred in telemetry dumper.", error=str(e))
        # Ensure raw files are deleted if left behind on system error
        if os.path.exists(csv_filepath):
            os.remove(csv_filepath)
        return False


if __name__ == "__main__":
    is_dry = "--dry-run" in sys.argv
    asyncio.run(execute_monthly_dump(dry_run=is_dry))
