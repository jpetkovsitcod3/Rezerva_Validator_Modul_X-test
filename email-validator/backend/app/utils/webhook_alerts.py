#!/usr/bin/env python3
# ==============================================================================
# BRIDGE Modul X - Production Webhook Alert Templates & Signing Dispatcher
# ==============================================================================
# This module defines JSON alert templates and manages cryptographically signed
# webhook dispatches to client notification systems. It uses HMAC-SHA256 signatures
# so receiving targets can securely verify payload authenticity [106, 111].
# ==============================================================================

import hmac
import hashlib
import time
import json
import os
import asyncio
from typing import Dict, Any, Optional
import httpx
import structlog

logger = structlog.get_logger("webhook_alerts")

# Try to load app settings if available
try:
    from app.config import settings
except ImportError:
    class FallbackSettings:
        # Secret string used to generate HMAC signatures [106]
        WEBHOOK_SIGNING_SECRET = os.getenv("WEBHOOK_SIGNING_SECRET", "modulx_secret_sec_auth_key_102938")
        SYSTEM_TIMEOUT = 10.0
    settings = FallbackSettings()


class WebhookDispatcher:
    """
    Formulates and dispatches signed webhook event payloads to client systems [106].
    """

    @staticmethod
    def calculate_signature(payload: str, secret: str) -> str:
        """
        Computes HMAC-SHA256 signature for verification checks [106, 111].
        """
        return hmac.new(
            secret.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    @classmethod
    async def dispatch(cls, url: str, event_type: str, data: Dict[str, Any], custom_secret: Optional[str] = None) -> bool:
        """
        Asynchronously sends signed JSON payloads with Retry logic and structured logs.
        """
        secret = custom_secret or settings.WEBHOOK_SIGNING_SECRET
        timestamp = str(int(time.time()))
        
        # Structure the standardized wrapper envelope [106]
        envelope = {
            "event_id": f"evt_{timestamp}_{hash(event_type) & 0xfffffff}",
            "event_type": event_type,
            "timestamp": timestamp,
            "data": data
        }
        
        serialized_payload = json.dumps(envelope, sort_keys=True)
        
        # Construct HMAC signature mixing body payload + timestamp to prevent replay attacks [106]
        signature_base = f"t={timestamp},v1={serialized_payload}"
        signature = cls.calculate_signature(signature_base, secret)

        headers = {
            "Content-Type": "application/json",
            "X-ModulX-Signature": f"t={timestamp},v1={signature}",
            "User-Agent": "BRIDGE-ModulX-Webhook-Engine/2.0.0"
        }

        # Dispatch using HTTPX AsyncClient with exponential backoff on server throttles [106]
        async with httpx.AsyncClient(timeout=10.0) as client:
            retries = 3
            backoff = 1.0
            
            for attempt in range(1, retries + 1):
                try:
                    logger.info("Dispatching webhook event...", url=url, event=event_type, attempt=attempt)
                    response = await client.post(url, headers=headers, content=serialized_payload)
                    
                    if response.status_code in (200, 201, 202, 204):
                        logger.info("Webhook acknowledged successfully.", url=url, status_code=response.status_code)
                        return True
                    elif 400 <= response.status_code < 500:
                        logger.error("Client rejected payload. Aborting dispatch.", url=url, status_code=response.status_code)
                        return False
                    else:
                        logger.warning("Server threw transient error code. Scheduling backoff.", url=url, status_code=response.status_code)

                except httpx.RequestError as req_err:
                    logger.warning("Transport network error during dispatch attempt.", url=url, error=str(req_err))
                
                if attempt < retries:
                    await asyncio.sleep(backoff)
                    backoff *= 2.0
            
            logger.error("All webhook retry attempts exhausted. Delivery failed.", url=url, event=event_type)
            return False


# ==============================================================================
# high-fidelity JSON Webhook Payload Templates
# ==============================================================================

def get_campaign_completed_template(job_id: str, total_count: int, valid_count: int, invalid_count: int, risky_count: int, duration_sec: float) -> Dict[str, Any]:
    """
    Template payload emitted when a bulk verification campaign completes [106, 111].
    """
    return {
        "job_id": job_id,
        "summary": {
            "total_records": total_count,
            "processed_records": valid_count + invalid_count + risky_count,
            "valid_deliverable": valid_count,
            "invalid_blocked": invalid_count,
            "risky_catchall": risky_count,
            "accuracy_ratio": round((valid_count / total_count * 100), 2) if total_count > 0 else 100.0,
            "elapsed_seconds": round(duration_sec, 2)
        },
        "metadata": {
            "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "platform_cluster": "modulx-celery-pool-01"
        }
    }


def get_security_breach_template(email: str, risk_score: int, violation_reason: str) -> Dict[str, Any]:
    """
    Template payload emitted immediately when a high-risk provider block list or 
    burn domain spam pattern gets processed in real-time [106, 111].
    """
    return {
        "security_incident_id": f"sec_alert_{int(time.time())}",
        "severity": "CRITICAL",
        "incident_type": "HIGH_RISK_RECIPIENT_SCRUTINIZED",
        "details": {
            "target_recipient": email,
            "risk_score": risk_score,
            "risk_level": "HIGH",
            "reason": violation_reason,
            "suggested_action": "REJECT_TRANSACTION_AND_FLAG_ACCOUNT"
        },
        "logged_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


def get_system_alert_template(metric_name: str, threshold: float, current_value: float) -> Dict[str, Any]:
    """
    Template payload emitted to system administrators if queue backlog sizes or API latencies
    breach acceptable performance thresholds [106].
    """
    return {
        "sys_alert_id": f"sys_warn_{int(time.time())}",
        "severity": "WARNING",
        "system_status": "DEGRADED",
        "metric_violated": metric_name,
        "alert_conditions": {
            "threshold_limit": threshold,
            "active_value": current_value,
            "deviation_percentage": round(((current_value - threshold) / threshold * 100), 1) if threshold > 0 else 100.0
        },
        "triggered_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


# Quick self-test demonstrating webhook signing mechanics
if __name__ == "__main__":
    print("\n" + "="*80)
    print("      BRIDGE Modul X - Webhook Payload Template Demonstrations")
    print("="*80 + "\n")
    
    # 1. Generate Campaign Completed Mock Data
    camp_payload = get_campaign_completed_template(
        job_id="9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        total_count=1000,
        valid_count=820,
        invalid_count=120,
        risky_count=60,
        duration_sec=14.85
    )
    print("--- 1. [CAMPAIGN_COMPLETED] payload template ---")
    print(json.dumps(camp_payload, indent=2))
    print("\n" + "-"*80 + "\n")

    # 2. Generate Security Real-time Breach Alert
    sec_payload = get_security_breach_template(
        email="spammer@tempburner-provider.org",
        risk_score=15,
        violation_reason="disposable_burner_blocklist_match"
    )
    print("--- 2. [SECURITY_HIGH_RISK_DETECTED] payload template ---")
    print(json.dumps(sec_payload, indent=2))
    print("\n" + "-"*80 + "\n")

    # 3. Signature Sample
    test_secret = "my_super_secure_key"
    payload_str = json.dumps(sec_payload, sort_keys=True)
    ts = str(int(time.time()))
    sig_base = f"t={ts},v1={payload_str}"
    sig = WebhookDispatcher.calculate_signature(sig_base, test_secret)
    print("--- HMAC-SHA256 Signature Header Template ---")
    print(f"X-ModulX-Signature: t={ts},v1={sig}")
    print("="*80 + "\n")
