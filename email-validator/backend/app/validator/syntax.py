import re
from email_validator import validate_email, EmailNotValidError
from ..models import SyntaxResult

# Extended RFC 5321 regex for edge cases
RFC_5321_REGEX = re.compile(
    r'^(?:[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+'
    r'(?:\.[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+)*'
    r'|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]'
    r'|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")'
    r'@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)'
    r'+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?'
    r'|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}'
    r'(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?'
    r'|[a-zA-Z0-9-]*[a-zA-Z0-9]:'
    r'(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]'
    r'|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$'
)


def validate_syntax(email: str) -> SyntaxResult:
    """
    Layer 1: Multi-method syntax validation.
    Uses email-validator library (RFC 5321/5322) + regex fallback.
    """
    # Quick length checks
    if not email or len(email) > 254:
        return SyntaxResult(
            passed=False,
            error=f"Email length invalid: {len(email)} chars (max 254)"
        )

    if '@' not in email:
        return SyntaxResult(passed=False, error="Missing @ symbol")

    local_part, _, domain_part = email.rpartition('@')

    if len(local_part) > 64:
        return SyntaxResult(
            passed=False,
            error="Local part exceeds 64 characters (RFC 5321)"
        )

    # Try email-validator (most comprehensive)
    try:
        validated = validate_email(
            email,
            check_deliverability=False,
            allow_smtputf8=True,
            allow_empty_local=False
        )
        return SyntaxResult(
            passed=True,
            normalized_email=validated.normalized,
            local_part=validated.local_part,
            domain=validated.domain
        )
    except EmailNotValidError as e:
        # Fallback: check with regex
        if RFC_5321_REGEX.match(email):
            return SyntaxResult(
                passed=True,
                normalized_email=email,
                local_part=local_part,
                domain=domain_part
            )
        return SyntaxResult(
            passed=False,
            error=str(e)
        )
    except Exception as e:
        return SyntaxResult(
            passed=False,
            error=f"Unexpected syntax error: {str(e)}"
        )
