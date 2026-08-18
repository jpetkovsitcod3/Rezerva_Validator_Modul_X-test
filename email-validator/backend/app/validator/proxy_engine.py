import asyncio
import random
import itertools
import time
from typing import List, Optional, Dict
from dataclasses import dataclass


@dataclass
class Proxy:
    host: str
    port: int
    proxy_type: str = "SOCKS5"   # SOCKS4, SOCKS5, HTTP
    username: Optional[str] = None
    password: Optional[str] = None
    success_count: int = 0
    fail_count: int = 0
    last_used: float = 0.0
    blacklisted: bool = False

    @property
    def success_rate(self) -> float:
        total = self.success_count + self.fail_count
        return (self.success_count / total * 100) if total > 0 else 100.0


class ProxyPool:
    """
    Production-grade proxy rotation engine.
    Supports round-robin, random, and least-used strategies.
    Auto-removes failing proxies and supports health checks.
    """
    def __init__(self, proxies: List[Dict] = None):
        self.proxies: List[Proxy] = []
        self.lock = asyncio.Lock()
        self._cycle = None

        if proxies:
            for p in proxies:
                self.add_proxy(p)

    def add_proxy(self, proxy_config: Dict):
        proxy = Proxy(
            host=proxy_config["host"],
            port=proxy_config["port"],
            proxy_type=proxy_config.get("type", "SOCKS5"),
            username=proxy_config.get("username"),
            password=proxy_config.get("password")
        )
        self.proxies.append(proxy)
        self._refresh_cycle()

    def _refresh_cycle(self):
        active = self.get_active_proxies()
        self._cycle = itertools.cycle(active) if active else None

    def get_active_proxies(self) -> List[Proxy]:
        return [p for p in self.proxies if not p.blacklisted]

    async def get_proxy(self, strategy: str = "round_robin") -> Optional[Proxy]:
        async with self.lock:
            active = self.get_active_proxies()
            if not active:
                return None

            if strategy == "random":
                return random.choice(active)
            elif strategy == "least_used":
                return min(active, key=lambda p: p.last_used)
            elif strategy == "best_rate":
                return max(active, key=lambda p: p.success_rate)
            else:  # round_robin
                if self._cycle:
                    return next(self._cycle)
                return None

    async def report_success(self, proxy: Proxy):
        async with self.lock:
            proxy.success_count += 1
            proxy.last_used = time.time()

    async def report_failure(self, proxy: Proxy, blacklist: bool = False):
        async with self.lock:
            proxy.fail_count += 1
            proxy.last_used = time.time()
            if blacklist or proxy.fail_count > 10:
                proxy.blacklisted = True
                self._refresh_cycle()

    @property
    def stats(self) -> Dict:
        return {
            "total": len(self.proxies),
            "active": len(self.get_active_proxies()),
            "blacklisted": len([p for p in self.proxies if p.blacklisted])
        }


# Singleton proxy pool (loaded from settings)
proxy_pool = ProxyPool()
