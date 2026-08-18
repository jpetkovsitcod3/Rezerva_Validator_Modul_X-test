import asyncio
import socket
import smtplib
import socks
import random
from typing import Optional, Tuple
from ..models import SMTPResult
from ..config import settings
from .proxy_engine import proxy_pool

# Probe email addresses used for RCPT testing
PROBE_SENDERS = [
    "probe@validator-check.com",
    "verify@mailcheck-service.net",
    "check@emailverify-sys.org",
]

# Gibberish email for catch-all detection
GIBBERISH_LOCAL = "xdz9k2mrpqwf8nvj3ths"


class AsyncSMTPVerifier:
    """
    Production SMTP verifier with:
    - Async operation
    - Proxy support (SOCKS4/5)
    - TLS detection
    - Catch-all detection
    - Smart error handling
    """

    def __init__(self, timeout: int = 10):
        self.timeout = timeout

    async def verify(self, email: str, mx_host: str, use_proxy: bool = False) -> SMTPResult:
        """Run SMTP verification in executor to avoid blocking."""
        loop = asyncio.get_event_loop()
        try:
            result = await asyncio.wait_for(
                loop.run_in_executor(
                    None,
                    self._smtp_verify_sync,
                    email,
                    mx_host,
                    use_proxy
                ),
                timeout=self.timeout + 5
            )
            return result
        except asyncio.TimeoutError:
            return SMTPResult(verified=None, error="SMTP verification timed out")

    def _smtp_verify_sync(self, email: str, mx_host: str, use_proxy: bool) -> SMTPResult:
        """Synchronous SMTP verification (run in executor)."""
        sender = random.choice(PROBE_SENDERS)
        proxy = None
        smtp = None

        try:
            if use_proxy and proxy_pool.get_active_proxies():
                # Use SOCKS proxy
                sock = socks.socksocket()
                active_proxies = proxy_pool.get_active_proxies()
                proxy = random.choice(active_proxies)

                proxy_type = (
                    socks.SOCKS5 if proxy.proxy_type == "SOCKS5"
                    else socks.SOCKS4 if proxy.proxy_type == "SOCKS4"
                    else socks.HTTP
                )

                if proxy.username and proxy.password:
                    sock.set_proxy(proxy_type, proxy.host, proxy.port,
                                   True, proxy.username, proxy.password)
                else:
                    sock.set_proxy(proxy_type, proxy.host, proxy.port)

                sock.settimeout(self.timeout)
                sock.connect((mx_host, 25))

                smtp = smtplib.SMTP(timeout=self.timeout)
                smtp.sock = sock
                smtp.file = smtp.sock.makefile('rb')
                smtp._get_socket = lambda *args, **kwargs: sock
            else:
                # Direct connection
                smtp = smtplib.SMTP(host=mx_host, port=25, timeout=self.timeout)

            # Get server banner (safe even if connect partially failed)
            try:
                welcome = smtp.getwelcome()
                banner = welcome.decode('utf-8', errors='replace') if isinstance(welcome, bytes) else str(welcome)
            except Exception:
                banner = ""

            # EHLO handshake
            code, resp = smtp.ehlo("emailvalidator.local")
            if code != 250:
                smtp.helo("emailvalidator.local")

            # Check TLS support
            supports_tls = bool(smtp.esmtp_features and 'STARTTLS' in smtp.esmtp_features)

            # Set from address
            smtp.mail(sender)

            # The key RCPT check
            code, message = smtp.rcpt(email)

            try:
                smtp.quit()
            except Exception:
                pass

            if proxy:
                proxy.success_count += 1

            return SMTPResult(
                verified=code == 250,
                smtp_code=code,
                smtp_message=self._decode(message),
                server_banner=banner,
                supports_tls=supports_tls,
                via_proxy=use_proxy and proxy is not None
            )

        except smtplib.SMTPRecipientsRefused as e:
            if proxy:
                proxy.fail_count += 1
            errors = e.recipients
            for _, (code, msg) in errors.items():
                return SMTPResult(
                    verified=False,
                    smtp_code=code,
                    smtp_message=self._decode(msg),
                    via_proxy=use_proxy and proxy is not None
                )
            return SMTPResult(verified=False, error="Recipients refused")

        except smtplib.SMTPConnectError as e:
            return SMTPResult(
                verified=None,
                smtp_code=e.smtp_code,
                error=f"Connection failed: {str(e)}"
            )
        except (socket.timeout, TimeoutError):
            return SMTPResult(verified=None, error="SMTP connection timed out")
        except ConnectionRefusedError:
            return SMTPResult(verified=None, error="SMTP connection refused (port 25 blocked)")
        except Exception as e:
            return SMTPResult(verified=None, error=f"SMTP error: {str(e)}")

    @staticmethod
    def _decode(value) -> str:
        if isinstance(value, bytes):
            return value.decode('utf-8', errors='replace')
        return str(value)

    async def check_catch_all(self, domain: str, mx_host: str) -> Tuple[bool, float]:
        """
        Detect catch-all by probing gibberish email.
        Returns (is_catch_all, confidence_score)
        """
        fake_email = f"{GIBBERISH_LOCAL}@{domain}"
        result = await self.verify(fake_email, mx_host)

        if result.verified is True:
            return True, 0.95
        elif result.verified is False:
            return False, 0.90
        else:
            return False, 0.0  # Unknown, can't determine


smtp_verifier = AsyncSMTPVerifier(timeout=settings.smtp_timeout)
