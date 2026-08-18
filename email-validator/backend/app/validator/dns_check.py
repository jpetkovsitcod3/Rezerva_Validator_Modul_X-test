import dns.resolver
import dns.asyncresolver
import dns.exception
from ..models import DNSResult

DKIM_SELECTORS = ['default', 'google', 'selector1', 'selector2', 'dkim', 'k1']


async def check_dns(domain: str, timeout: int = 5) -> DNSResult:
    """
    Layer 2 & 3: Async DNS + MX Record validation.
    Also checks SPF, DMARC, DKIM authentication records.
    """
    resolver = dns.asyncresolver.Resolver()
    resolver.timeout = timeout
    resolver.lifetime = timeout

    # ---- MX Records --------------------------------------------------
    mx_records = []
    domain_exists = False
    has_mx = False

    try:
        mx_answers = await resolver.resolve(domain, 'MX')
        has_mx = True
        domain_exists = True
        for r in sorted(mx_answers, key=lambda x: x.preference):
            mx_records.append({
                "host": str(r.exchange).rstrip('.'),
                "priority": r.preference
            })
    except dns.resolver.NXDOMAIN:
        return DNSResult(
            domain_exists=False,
            has_mx_records=False,
            error="Domain does not exist (NXDOMAIN)"
        )
    except dns.resolver.NoAnswer:
        # No MX -> try A/AAAA fallback per RFC
        try:
            await resolver.resolve(domain, 'A')
            domain_exists = True
        except Exception:
            try:
                await resolver.resolve(domain, 'AAAA')
                domain_exists = True
            except Exception:
                pass
    except dns.exception.Timeout:
        return DNSResult(
            domain_exists=False,
            has_mx_records=False,
            error="DNS timeout"
        )
    except Exception as e:
        return DNSResult(
            domain_exists=False,
            has_mx_records=False,
            error=str(e)
        )

    # ---- SPF Record ---------------------------------------------------
    has_spf = False
    spf_record = None
    try:
        txt_answers = await resolver.resolve(domain, 'TXT')
        for record in txt_answers:
            txt = b''.join(record.strings).decode('utf-8', errors='replace')
            if txt.startswith('v=spf1'):
                has_spf = True
                spf_record = txt
                break
    except Exception:
        pass

    # ---- DMARC Record -------------------------------------------------
    has_dmarc = False
    dmarc_record = None
    try:
        dmarc_domain = f"_dmarc.{domain}"
        dmarc_answers = await resolver.resolve(dmarc_domain, 'TXT')
        for record in dmarc_answers:
            txt = b''.join(record.strings).decode('utf-8', errors='replace')
            if 'DMARC1' in txt:
                has_dmarc = True
                dmarc_record = txt
                break
    except Exception:
        pass

    # ---- DKIM Record --------------------------------------------------
    has_dkim = False
    for selector in DKIM_SELECTORS:
        try:
            dkim_domain = f"{selector}._domainkey.{domain}"
            dkim_answers = await resolver.resolve(dkim_domain, 'TXT')
            for record in dkim_answers:
                txt = b''.join(record.strings).decode('utf-8', errors='replace')
                if 'DKIM1' in txt or 'k=rsa' in txt or 'p=' in txt:
                    has_dkim = True
                    break
            if has_dkim:
                break
        except Exception:
            continue

    return DNSResult(
        domain_exists=domain_exists,
        has_mx_records=has_mx,
        mx_records=mx_records,
        has_spf=has_spf,
        spf_record=spf_record,
        has_dmarc=has_dmarc,
        dmarc_record=dmarc_record,
        has_dkim=has_dkim
    )
