import disposable_email_domains
from ..models import DisposableResult

# Extended free provider list
FREE_PROVIDERS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "aol.com", "icloud.com", "protonmail.com", "zoho.com",
    "mail.com", "yandex.com", "yandex.ru", "gmx.com",
    "gmx.net", "live.com", "msn.com", "me.com",
    "mac.com", "googlemail.com", "yahoo.co.uk", "yahoo.fr",
    "yahoo.de", "yahoo.it", "yahoo.es", "yahoo.com.br",
    "hotmail.fr", "hotmail.de", "hotmail.it", "hotmail.es",
    "hotmail.co.uk", "fastmail.com", "tutanota.com",
    "pm.me", "proton.me", "hey.com", "duck.com"
}

# Role-based email prefixes
ROLE_BASED_PREFIXES = {
    "admin", "info", "support", "help", "sales", "contact",
    "hello", "hi", "noreply", "no-reply", "noreply",
    "donotreply", "do-not-reply", "webmaster", "postmaster",
    "abuse", "security", "billing", "accounts", "hr",
    "humanresources", "marketing", "team", "staff", "office",
    "enquiries", "enquiry", "inquiry", "feedback", "service",
    "services", "care", "press", "media", "privacy",
    "legal", "compliance", "jobs", "careers", "recruitment",
    "newsletter", "notifications", "alerts", "updates",
    "root", "sys", "sysadmin", "system", "ops", "devops",
    "dev", "api", "mail", "email", "bounce", "mailer"
}

# Nice names for common free providers
PROVIDER_MAP = {
    "gmail.com": "Gmail (Google)",
    "yahoo.com": "Yahoo Mail",
    "hotmail.com": "Hotmail (Microsoft)",
    "outlook.com": "Outlook (Microsoft)",
    "icloud.com": "iCloud (Apple)",
    "protonmail.com": "ProtonMail",
    "proton.me": "Proton Mail",
    "zoho.com": "Zoho Mail",
}


def check_disposable(email: str, domain: str) -> DisposableResult:
    """
    Layer 4: Comprehensive disposable, free provider,
    and role-based detection.
    """
    local_part = email.split('@')[0].lower()

    # Disposable domain check (100K+ domains database)
    is_disposable = domain in disposable_email_domains.blocklist

    # Free provider check
    is_free = domain in FREE_PROVIDERS

    # Role-based check (exact match + prefix match)
    is_role = (
        local_part in ROLE_BASED_PREFIXES or
        any(local_part.startswith(prefix)
            for prefix in ROLE_BASED_PREFIXES)
    )

    # Determine provider name
    provider_name = None
    if is_free:
        provider_name = PROVIDER_MAP.get(domain, "Free Email Provider")
    elif is_disposable:
        provider_name = "Disposable/Temporary Email"

    return DisposableResult(
        is_disposable=is_disposable,
        is_free_provider=is_free,
        is_role_based=is_role,
        provider_name=provider_name
    )
