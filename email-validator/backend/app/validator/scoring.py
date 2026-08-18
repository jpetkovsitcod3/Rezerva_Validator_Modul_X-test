from typing import Optional
from ..models import (
    SyntaxResult, DNSResult, DisposableResult,
    CatchAllResult, SMTPResult, ScoringResult, RiskLevel
)


def calculate_score(
    syntax: SyntaxResult,
    dns: Optional[DNSResult],
    disposable: Optional[DisposableResult],
    catch_all: Optional[CatchAllResult],
    smtp: Optional[SMTPResult]
) -> ScoringResult:
    """
    Layer 7: Comprehensive deliverability scoring.
    Score: 0-100 (higher = better deliverability)
    """
    score = 100
    breakdown = {}
    warnings = []

    # ---- Syntax (up to -50) ------------------------------------------
    if not syntax.passed:
        breakdown["syntax"] = -50
        score -= 50
    else:
        breakdown["syntax"] = 0

    # ---- Domain/MX (up to -30) ---------------------------------------
    if dns:
        if not dns.domain_exists:
            breakdown["domain"] = -30
            score -= 30
            warnings.append("Domain does not exist")
        elif not dns.has_mx_records:
            breakdown["mx_records"] = -20
            score -= 20
            warnings.append("No MX records found — domain cannot receive email")
        else:
            breakdown["domain"] = 0
            breakdown["mx_records"] = 0

        # Authentication bonuses/penalties
        if dns.has_spf:
            breakdown["spf"] = 3
            score += 3
        else:
            warnings.append("No SPF record — increases spam risk")

        if dns.has_dmarc:
            breakdown["dmarc"] = 3
            score += 3
        else:
            warnings.append("No DMARC record configured")

        if dns.has_dkim:
            breakdown["dkim"] = 2
            score += 2

    # ---- Disposable (-40) --------------------------------------------
    if disposable:
        if disposable.is_disposable:
            breakdown["disposable"] = -40
            score -= 40
            warnings.append("Disposable/temporary email domain detected")
        elif disposable.is_role_based:
            breakdown["role_based"] = -10
            score -= 10
            warnings.append("Role-based email (admin@, info@, etc.) — low engagement risk")
        elif disposable.is_free_provider:
            breakdown["free_provider"] = -5
            score -= 5

    # ---- Catch-All (-20) ---------------------------------------------
    if catch_all and catch_all.is_catch_all:
        breakdown["catch_all"] = -20
        score -= 20
        warnings.append("Catch-all domain — cannot verify specific mailbox")

    # ---- SMTP Verification -------------------------------------------
    if smtp:
        if smtp.verified is True:
            breakdown["smtp"] = 10
            score += 10
        elif smtp.verified is False:
            breakdown["smtp"] = -30
            score -= 30
            warnings.append(f"Mailbox does not exist (SMTP {smtp.smtp_code})")
        else:
            # Unknown / blocked
            breakdown["smtp"] = -5
            score -= 5
            if smtp.error:
                warnings.append(f"SMTP check inconclusive: {smtp.error}")

    # Clamp score between 0 and 100
    score = max(0, min(100, score))

    # Determine risk level
    if score >= 75:
        risk = RiskLevel.LOW
    elif score >= 45:
        risk = RiskLevel.MEDIUM
    else:
        risk = RiskLevel.HIGH

    return ScoringResult(
        score=score,
        risk_level=risk,
        breakdown=breakdown,
        warnings=warnings
    )
