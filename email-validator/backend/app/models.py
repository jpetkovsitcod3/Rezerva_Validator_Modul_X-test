from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
from enum import Enum


# ---- Enums -----------------------------------------------------------
class ValidationStatus(str, Enum):
    VALID   = "valid"
    INVALID = "invalid"
    RISKY   = "risky"
    UNKNOWN = "unknown"


class RiskLevel(str, Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"


# ---- Layer Results ----------------------------------------------------
class SyntaxResult(BaseModel):
    passed: bool
    normalized_email: Optional[str] = None
    local_part: Optional[str] = None
    domain: Optional[str] = None
    error: Optional[str] = None


class DNSResult(BaseModel):
    domain_exists: bool
    has_mx_records: bool
    mx_records: List[Dict[str, Any]] = []
    has_spf: bool = False
    spf_record: Optional[str] = None
    has_dmarc: bool = False
    dmarc_record: Optional[str] = None
    has_dkim: bool = False
    error: Optional[str] = None


class DisposableResult(BaseModel):
    is_disposable: bool
    is_free_provider: bool
    is_role_based: bool
    provider_name: Optional[str] = None


class CatchAllResult(BaseModel):
    is_catch_all: bool
    confidence: float = 0.0
    error: Optional[str] = None


class SMTPResult(BaseModel):
    verified: Optional[bool] = None
    smtp_code: Optional[int] = None
    smtp_message: Optional[str] = None
    server_banner: Optional[str] = None
    supports_tls: bool = False
    error: Optional[str] = None
    via_proxy: bool = False


class ScoringResult(BaseModel):
    score: int
    risk_level: RiskLevel
    breakdown: Dict[str, int] = {}
    warnings: List[str] = []


# ---- Main Response ----------------------------------------------------
class ValidationResult(BaseModel):
    email: str
    status: ValidationStatus
    syntax: SyntaxResult
    dns: Optional[DNSResult] = None
    disposable: Optional[DisposableResult] = None
    catch_all: Optional[CatchAllResult] = None
    smtp: Optional[SMTPResult] = None
    scoring: ScoringResult
    processing_time_ms: float
    validated_at: str


class SingleEmailRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def strip_email(cls, v: str) -> str:
        return v.strip().lower()


class BulkEmailRequest(BaseModel):
    emails: List[str]
    webhook_url: Optional[str] = None

    @field_validator("emails")
    @classmethod
    def limit_emails(cls, v: List[str]) -> List[str]:
        if len(v) > 10000:
            raise ValueError("Max 10,000 emails per bulk request")
        return [e.strip().lower() for e in v]


class BulkValidationResponse(BaseModel):
    task_id: str
    status: str
    total: int
    message: str


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    progress: Optional[int] = None
    total: Optional[int] = None
    results: Optional[List[ValidationResult]] = None
