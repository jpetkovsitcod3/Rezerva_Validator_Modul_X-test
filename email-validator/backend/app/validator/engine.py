import asyncio
import time
from datetime import datetime, timezone
from typing import Optional
import structlog

from ..models import (
    ValidationResult, ValidationStatus,
    ScoringResult, RiskLevel, CatchAllResult, SMTPResult
)
from ..config import settings
from .syntax import validate_syntax
from .dns_check import check_dns
from .disposable import check_disposable
from .smtp_verify import smtp_verifier
from .scoring import calculate_score

logger = structlog.get_logger()


class EmailValidationEngine:
    """
    Master 7-Layer Email Validation Orchestrator.

    Layers:
      1. Syntax / RFC 5321 check
      2. DNS domain existence
      3. MX record verification
      4. Disposable / Role-based / Free provider detection
      5. Catch-all domain detection
      6. SMTP mailbox verification
      7. AI/Heuristic deliverability scoring
    """

    def __init__(self):
        self.use_proxies = settings.use_proxies

    async def validate(self, email: str, deep: bool = True) -> ValidationResult:
        start_time = time.monotonic()

        log = logger.bind(email=email)
        log.info("validation_started")

        # ---- Layer 1: Syntax -----------------------------------------
        syntax = validate_syntax(email)

        if not syntax.passed:
            elapsed = (time.monotonic() - start_time) * 1000
            scoring = calculate_score(syntax, None, None, None, None)
            log.warning("syntax_failed", error=syntax.error)
            return ValidationResult(
                email=email,
                status=ValidationStatus.INVALID,
                syntax=syntax,
                scoring=scoring,
                processing_time_ms=round(elapsed, 2),
                validated_at=datetime.now(timezone.utc).isoformat()
            )

        domain = syntax.domain
        normalized_email = syntax.normalized_email or email

        # ---- Layers 2 & 3: DNS + MX ---------------------------------
        dns_result = await check_dns(domain, settings.dns_timeout)

        if not dns_result.domain_exists or not dns_result.has_mx_records:
            elapsed = (time.monotonic() - start_time) * 1000
            scoring = calculate_score(syntax, dns_result, None, None, None)
            log.warning("dns_failed", domain=domain)
            return ValidationResult(
                email=normalized_email,
                status=ValidationStatus.INVALID,
                syntax=syntax,
                dns=dns_result,
                scoring=scoring,
                processing_time_ms=round(elapsed, 2),
                validated_at=datetime.now(timezone.utc).isoformat()
            )

        # ---- Layer 4: Disposable Detection ---------------------------
        disposable = check_disposable(normalized_email, domain)

        if not deep:
            # Fast path: skip SMTP for quick validation
            elapsed = (time.monotonic() - start_time) * 1000
            scoring = calculate_score(syntax, dns_result, disposable, None, None)
            status = self._determine_status(scoring)
            return ValidationResult(
                email=normalized_email,
                status=status,
                syntax=syntax,
                dns=dns_result,
                disposable=disposable,
                scoring=scoring,
                processing_time_ms=round(elapsed, 2),
                validated_at=datetime.now(timezone.utc).isoformat()
            )

        # ---- Layers 5 & 6: Catch-All + SMTP --------------------------
        mx_host = dns_result.mx_records[0]["host"]

        # Run catch-all and SMTP in parallel for speed
        catch_all_task = asyncio.create_task(
            smtp_verifier.check_catch_all(domain, mx_host)
        )
        smtp_task = asyncio.create_task(
            smtp_verifier.verify(normalized_email, mx_host, self.use_proxies)
        )

        catch_all_raw, smtp_result = await asyncio.gather(
            catch_all_task, smtp_task, return_exceptions=True
        )

        # Handle catch-all result
        if isinstance(catch_all_raw, Exception):
            catch_all = CatchAllResult(is_catch_all=False, error=str(catch_all_raw))
        else:
            is_catch_all, confidence = catch_all_raw
            catch_all = CatchAllResult(is_catch_all=is_catch_all, confidence=confidence)

        # Handle SMTP result
        if isinstance(smtp_result, Exception):
            smtp_result = SMTPResult(verified=None, error=str(smtp_result))

        # ---- Layer 7: Scoring ----------------------------------------
        scoring = calculate_score(
            syntax, dns_result, disposable, catch_all, smtp_result
        )

        status = self._determine_status(scoring)
        elapsed = (time.monotonic() - start_time) * 1000

        log.info("validation_complete", status=status, score=scoring.score,
                 time_ms=round(elapsed, 2))

        return ValidationResult(
            email=normalized_email,
            status=status,
            syntax=syntax,
            dns=dns_result,
            disposable=disposable,
            catch_all=catch_all,
            smtp=smtp_result,
            scoring=scoring,
            processing_time_ms=round(elapsed, 2),
            validated_at=datetime.now(timezone.utc).isoformat()
        )

    def _determine_status(self, scoring: ScoringResult) -> ValidationStatus:
        if scoring.score >= 75:
            return ValidationStatus.VALID
        elif scoring.score >= 45:
            return ValidationStatus.RISKY
        elif scoring.score > 0:
            return ValidationStatus.UNKNOWN
        else:
            return ValidationStatus.INVALID


# Singleton engine
engine = EmailValidationEngine()
