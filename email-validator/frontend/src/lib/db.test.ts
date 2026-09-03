import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RATE_LIMIT_PER_MIN,
  apiAdminDeleteUser,
  apiAdminOverview,
  apiAdminPatchUser,
  apiAdminUsers,
  apiBlocklist,
  apiBlocklistAdd,
  apiBlocklistRemove,
  apiChangePassword,
  apiCreateKey,
  apiDeleteRecord,
  apiDomain,
  apiFinishJob,
  apiHistory,
  apiListJobs,
  apiListKeys,
  apiLogin,
  apiLogout,
  apiRevokeKey,
  apiSaveSettings,
  apiSettings,
  apiSignup,
  apiStartJob,
  apiStats,
  apiUpdateProfile,
  apiValidate,
  apiValidateFast,
  currentUserId,
  exportHistoryRows,
  fetchSessionUser,
  resetDemoData,
  touchKey,
} from "./db";
import { DISPOSABLE_SEED, judge, type EngineOptions } from "./engine";

/** db latency is setTimeout-based; fake timers keep every test deterministic. */
async function settle<T>(p: Promise<T>, ms = 1000): Promise<T> {
  // Mark the rejection as handled while timers advance; the original promise
  // is still returned so `expect(...).rejects` observes the real rejection.
  p.catch(() => {});
  await vi.advanceTimersByTimeAsync(ms);
  return p;
}

const fullOn: EngineOptions = {
  blocklist: [...DISPOSABLE_SEED],
  enabled: { syntax: true, dns: true, mx: true, disposable: true, catchall: true, smtp: true, scoring: true },
};

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  resetDemoData();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("auth", () => {
  it("should log in a seeded demo user and persist the session", async () => {
    const u = await settle(apiLogin("user@bridge.demo", "demo1234"));
    expect(u.id).toBe("u_demo");
    expect(u.credits).toBe(74);
    expect(currentUserId()).toBe("u_demo");
    const again = await settle(fetchSessionUser());
    expect(again?.email).toBe("user@bridge.demo");
  });

  it("should reject invalid credentials with an auth error", async () => {
    await expect(settle(apiLogin("user@bridge.demo", "wrong"))).rejects.toMatchObject({ code: "auth" });
    expect(currentUserId()).toBeNull();
  });

  it("should block suspended accounts with a suspended error", async () => {
    await expect(settle(apiLogin("jonas@nordpay.se", "demo1234"))).rejects.toMatchObject({ code: "suspended" });
  });

  it("should clear the session on logout", async () => {
    await settle(apiLogin("admin@bridge.demo", "demo1234"));
    apiLogout();
    expect(currentUserId()).toBeNull();
    expect(await settle(fetchSessionUser())).toBeNull();
  });

  it("should validate signup input and reject duplicates", async () => {
    await expect(settle(apiSignup("A", "ok@x.io", "password123"))).rejects.toMatchObject({ code: "validation" });
    await expect(settle(apiSignup("Name", "bad-email", "password123"))).rejects.toMatchObject({ code: "validation" });
    await expect(settle(apiSignup("Name", "ok@x.io", "short"))).rejects.toMatchObject({ code: "validation" });
    await expect(settle(apiSignup("Name", "admin@bridge.demo", "password123"))).rejects.toMatchObject({ code: "exists" });
  });

  it("should grant configured signup credits and start a session", async () => {
    const u = await settle(apiSignup("Test User", "test@user.io", "password123"));
    expect(u.credits).toBe(25);
    expect(u.role).toBe("user");
    expect(currentUserId()).toBe(u.id);
  });

  it("should update profile and change password with verification", async () => {
    const u = await settle(apiSignup("Test User", "test@user.io", "password123"));
    await settle(apiUpdateProfile(u.id, { name: "Renamed" }));
    const fresh = await settle(fetchSessionUser());
    expect(fresh?.name).toBe("Renamed");
    await expect(settle(apiChangePassword(u.id, "wrong-current", "newpassword1"))).rejects.toMatchObject({ code: "auth" });
    await settle(apiChangePassword(u.id, "password123", "newpassword1"));
    apiLogout();
    await expect(settle(apiLogin("test@user.io", "password123"))).rejects.toMatchObject({ code: "auth" });
    const back = await settle(apiLogin("test@user.io", "newpassword1"));
    expect(back.email).toBe("test@user.io");
  });
});

describe("credits & rate limiting", () => {
  it("should deduct one credit per deep validation", async () => {
    const u = await settle(apiLogin("user@bridge.demo", "demo1234"));
    const { verdict, record } = await settle(apiValidate(u, "maya.chen@stripe.com"));
    expect(verdict.status).toBe("valid");
    expect(record.mode).toBe("deep");
    const fresh = await settle(fetchSessionUser());
    expect(fresh?.credits).toBe(73);
  });

  it("should not charge for quick validations", async () => {
    const u = await settle(apiLogin("user@bridge.demo", "demo1234"));
    const { record } = await settle(apiValidate(u, "quick@stripe.com", { quick: true }));
    expect(record.mode).toBe("quick");
    const fresh = await settle(fetchSessionUser());
    expect(fresh?.credits).toBe(74);
  });

  it("should not charge admins", async () => {
    const admin = await settle(apiLogin("admin@bridge.demo", "demo1234"));
    await settle(apiValidate(admin, "maya.chen@stripe.com"));
    const fresh = await settle(fetchSessionUser());
    expect(fresh?.credits).toBe(99999);
  });

  it("should reject deep validations at zero credits", async () => {
    const u = await settle(apiSignup("Broke", "broke@x.io", "password123"));
    await settle(apiAdminPatchUser(u.id, { credits: 0 }));
    await expect(settle(apiValidate(u, "maya.chen@stripe.com"))).rejects.toMatchObject({ code: "credits" });
    // quick checks remain free even at zero
    const { record } = await settle(apiValidate(u, "maya.chen@stripe.com", { quick: true }));
    expect(record.mode).toBe("quick");
  });

  it(`should enforce the ${RATE_LIMIT_PER_MIN}/minute rate limit`, async () => {
    const u = await settle(apiSignup("Ratelimited", "rate@x.io", "password123"));
    for (let i = 0; i < RATE_LIMIT_PER_MIN; i++) {
      await settle(apiValidate(u, `user${i}@stripe.com`, { quick: true }));
    }
    await expect(settle(apiValidate(u, "one-more@stripe.com", { quick: true }))).rejects.toMatchObject({ code: "rate" });
  });
});

describe("history", () => {
  it("should filter by user, status and search term with paging", async () => {
    const page = await settle(apiHistory({ page: 1, pageSize: 10, status: "all" }));
    expect(page.total).toBeGreaterThan(0);
    expect(page.rows.length).toBeLessThanOrEqual(10);
    expect(page.pages).toBe(Math.ceil(page.total / 10));

    const invalid = await settle(apiHistory({ page: 1, pageSize: 50, status: "invalid" }));
    expect(invalid.rows.every((r) => r.status === "invalid")).toBe(true);

    const found = await settle(apiHistory({ page: 1, pageSize: 50, status: "all", search: "gmial" }));
    expect(found.rows.some((r) => r.email.includes("gmial.com"))).toBe(true);

    const mine = await settle(apiHistory({ userId: "u_demo", page: 1, pageSize: 200, status: "all" }));
    expect(mine.rows.every((r) => r.userId === "u_demo")).toBe(true);
  });

  it("should clamp out-of-range pages instead of returning empties unpredictably", async () => {
    const all = await settle(apiHistory({ page: 1, pageSize: 10, status: "all" }));
    const beyond = await settle(apiHistory({ page: 9999, pageSize: 10, status: "all" }));
    expect(beyond.pages).toBe(all.pages);
    expect(beyond.rows.length).toBeGreaterThan(0);
  });
});

describe("bulk jobs", () => {
  it("should track a job from running to completed with counts", async () => {
    const job = await settle(apiStartJob("u_demo", 3));
    expect(job.status).toBe("running");
    expect(job.finishedAt).toBeNull();
    await settle(
      apiFinishJob(job.id, {
        processed: 3,
        valid: 2,
        risky: 1,
        invalid: 0,
        status: "completed",
        rows: [
          { email: "a@stripe.com", status: "valid", score: 95 },
          { email: "b@stripe.com", status: "valid", score: 91 },
          { email: "info@megacorp.com", status: "risky", score: 52 },
        ],
      })
    );
    const jobs = await settle(apiListJobs("u_demo"));
    const done = jobs.find((j) => j.id === job.id)!;
    expect(done.status).toBe("completed");
    expect(done.finishedAt).not.toBeNull();
    expect(done.valid).toBe(2);
    expect(done.rows).toHaveLength(3);
  });
});

describe("api keys", () => {
  it("should create, cap at five active, and recover a slot on revoke", async () => {
    const seeded = await settle(apiListKeys("u_demo"));
    expect(seeded.filter((k) => !k.revokedAt)).toHaveLength(2);

    for (let i = 0; i < 3; i++) await settle(apiCreateKey("u_demo", `key-${i}`));
    await expect(settle(apiCreateKey("u_demo", "one-too-many"))).rejects.toMatchObject({ code: "limit" });
    await expect(settle(apiCreateKey("u_demo", "  "))).rejects.toMatchObject({ code: "validation" });

    await settle(apiRevokeKey(seeded[0].id));
    const created = await settle(apiCreateKey("u_demo", "replacement"));
    expect(created.key.startsWith("bx_live_")).toBe(true);
    const all = await settle(apiListKeys("u_demo"));
    expect(all.filter((k) => !k.revokedAt)).toHaveLength(5);
    expect(all.find((k) => k.id === seeded[0].id)?.revokedAt).not.toBeNull();
  });
});

describe("blocklist ↔ engine integration", () => {
  it("should validate domains, reject duplicates, and feed Layer 4", async () => {
    await expect(settle(apiBlocklistAdd("not_a_domain"))).rejects.toMatchObject({ code: "validation" });
    await expect(settle(apiBlocklistAdd("mailinator.com"))).rejects.toMatchObject({ code: "exists" });

    const list = await settle(apiBlocklistAdd("burner.test"));
    expect(list).toContain("burner.test");
    const verdict = judge("someone@burner.test", { ...fullOn, blocklist: list });
    expect(verdict.layers.find((l) => l.key === "disposable")!.status).toBe("fail");

    const after = await settle(apiBlocklistRemove("burner.test"));
    expect(after).not.toContain("burner.test");
    expect((await settle(apiBlocklist())).length).toBe(after.length);
  });
});

describe("settings", () => {
  it("should clamp creditsOnSignup and apply it to new signups", async () => {
    const current = await settle(apiSettings());
    const saved = await settle(apiSaveSettings({ ...current, creditsOnSignup: 50000 }));
    expect(saved.creditsOnSignup).toBe(10000);
    const u = await settle(apiSignup("Big Credits", "big@x.io", "password123"));
    expect(u.credits).toBe(10000);
  });

  it("should persist engine layer switches", async () => {
    const current = await settle(apiSettings());
    await settle(apiSaveSettings({ ...current, enabled: { ...current.enabled, smtp: false } }));
    const fresh = await settle(apiSettings());
    expect(fresh.enabled.smtp).toBe(false);
  });
});

describe("admin operations", () => {
  it("should clamp credit adjustments at zero", async () => {
    const patched = await settle(apiAdminPatchUser("u_demo", { credits: -500 }));
    expect(patched.credits).toBe(0);
  });

  it("should promote, suspend and reactivate users", async () => {
    const promoted = await settle(apiAdminPatchUser("u_tomas", { role: "admin" }));
    expect(promoted.role).toBe("admin");
    const suspended = await settle(apiAdminPatchUser("u_demo", { status: "suspended" }));
    expect(suspended.status).toBe("suspended");
    await expect(settle(apiLogin("user@bridge.demo", "demo1234"))).rejects.toMatchObject({ code: "suspended" });
    await settle(apiAdminPatchUser("u_demo", { status: "active" }));
    const back = await settle(apiLogin("user@bridge.demo", "demo1234"));
    expect(back.status).toBe("active");
  });

  it("should refuse to delete admin accounts", async () => {
    await expect(settle(apiAdminDeleteUser("u_admin"))).rejects.toMatchObject({ code: "forbidden" });
  });

  it("should cascade-delete a user's records and keys", async () => {
    const u = await settle(apiSignup("Temp", "temp@x.io", "password123"));
    await settle(apiValidate(u, "maya.chen@stripe.com"));
    await settle(apiCreateKey(u.id, "temp-key"));
    await settle(apiAdminDeleteUser(u.id));
    const history = await settle(apiHistory({ userId: u.id, page: 1, pageSize: 10, status: "all" }));
    expect(history.total).toBe(0);
    expect(await settle(apiListKeys(u.id))).toHaveLength(0);
  });

  it("should reseed with stable ids so demo logins survive a reset", async () => {
    resetDemoData();
    const users = await settle(apiAdminUsers());
    expect(users.map((u) => u.id)).toContain("u_admin");
    expect(users.map((u) => u.id)).toContain("u_demo");
    const admin = await settle(apiLogin("admin@bridge.demo", "demo1234"));
    expect(admin.role).toBe("admin");
  });
});

describe("fast validation & key touch", () => {
  it("should run fast validation without rate limit and deduct credits", async () => {
    const u = await settle(apiSignup("Fast", "fast@x.io", "password123"));
    const { verdict, record } = await settle(apiValidateFast(u, "maya.chen@stripe.com"));
    expect(verdict.status).toBe("valid");
    expect(record.mode).toBe("deep");
    const fresh = await settle(fetchSessionUser());
    expect(fresh?.credits).toBe(24);
  });

  it("should not charge admins on fast validation", async () => {
    const admin = await settle(apiLogin("admin@bridge.demo", "demo1234"));
    await settle(apiValidateFast(admin, "maya.chen@stripe.com"));
    const fresh = await settle(fetchSessionUser());
    expect(fresh?.credits).toBe(99999);
  });

  it("should update key lastUsedAt on touchKey", async () => {
    const u = await settle(apiLogin("user@bridge.demo", "demo1234"));
    const keys = await settle(apiListKeys(u.id));
    const keyId = keys[0].id;
    const before = keys[0].lastUsedAt;
    touchKey(keyId);
    await settle(Promise.resolve());
    const after = await settle(apiListKeys(u.id));
    expect(after.find((k) => k.id === keyId)?.lastUsedAt).toBeGreaterThan(before ?? 0);
  });

  it("should no-op touchKey on revoked or missing key", async () => {
    touchKey("nonexistent");
    await settle(Promise.resolve());
    const u = await settle(apiLogin("user@bridge.demo", "demo1234"));
    const keys = await settle(apiListKeys(u.id));
    await settle(apiRevokeKey(keys[0].id));
    const before = (await settle(apiListKeys(u.id))).find((k) => k.id === keys[0].id)?.lastUsedAt;
    touchKey(keys[0].id);
    await settle(Promise.resolve());
    const after = (await settle(apiListKeys(u.id))).find((k) => k.id === keys[0].id)?.lastUsedAt;
    expect(after).toBe(before);
  });
});

describe("record deletion & export", () => {
  it("should delete a specific record by id", async () => {
    const u = await settle(apiLogin("user@bridge.demo", "demo1234"));
    const { record } = await settle(apiValidate(u, "maya.chen@stripe.com"));
    const before = await settle(apiHistory({ userId: u.id, page: 1, pageSize: 10, status: "all" }));
    await settle(apiDeleteRecord(record.id));
    const after = await settle(apiHistory({ userId: u.id, page: 1, pageSize: 10, status: "all" }));
    expect(after.total).toBe(before.total - 1);
  });

  it("should export history rows with user names", async () => {
    const u = await settle(apiLogin("user@bridge.demo", "demo1234"));
    const { record } = await settle(apiValidate(u, "maya.chen@stripe.com"));
    const users = new Map<string, string>([["u_demo", "Noah Reyes"]]);
    const rows = exportHistoryRows([record], users);
    expect(rows[0]).toEqual([
      expect.any(String),
      "Noah Reyes",
      record.email,
      record.status,
      record.score,
      record.totalMs,
    ]);
  });
});

describe("stats & domain intelligence", () => {
  it("should compute stats with split, series and averages", async () => {
    const stats = await settle(apiStats());
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.split.valid + stats.split.risky + stats.split.invalid).toBe(stats.total);
    expect(stats.series).toHaveLength(14);
    expect(stats.avgMs).toBeGreaterThanOrEqual(0);
    expect(stats.today).toBeGreaterThanOrEqual(0);
    expect(stats.last7).toBeGreaterThanOrEqual(0);
  });

  it("should scope stats to a specific user", async () => {
    const u = await settle(apiLogin("user@bridge.demo", "demo1234"));
    const all = await settle(apiStats());
    const mine = await settle(apiStats(u.id));
    expect(mine.total).toBeLessThanOrEqual(all.total);
  });

  it("should return a domain report with MX/SPF/DMARC/DKIM", async () => {
    const report = await settle(apiDomain("stripe.com"));
    expect(report.domain).toBe("stripe.com");
    expect(report.mx).toBeDefined();
    expect(report.spf).toBeDefined();
    expect(report.dmarc).toBeDefined();
    expect(report.dkim).toBeDefined();
  });
});

describe("admin overview", () => {
  it("should aggregate users, validations, credits and top users", async () => {
    const ov = await settle(apiAdminOverview());
    expect(ov.users).toBeGreaterThan(0);
    expect(ov.active + ov.suspended).toBe(ov.users);
    expect(ov.validations).toBeGreaterThan(0);
    expect(ov.creditsOutstanding).toBeGreaterThanOrEqual(0);
    expect(ov.split.valid + ov.split.risky + ov.split.invalid).toBe(ov.validations);
    expect(ov.topUsers.length).toBeLessThanOrEqual(5);
    expect(ov.recentSignups.length).toBeLessThanOrEqual(5);
  });
});

describe("validate branches: quick path, admin bypass, rate limit, credits", () => {
  it("should take the quick path when quick=true and not charge credits", async () => {
    const u = await settle(apiSignup("Quick", "quick@x.io", "password123"));
    const { record } = await settle(apiValidate(u, "maya.chen@stripe.com", { quick: true }));
    expect(record.mode).toBe("quick");
    const fresh = await settle(fetchSessionUser());
    expect(fresh?.credits).toBe(25);
  });

  it("should bypass credit check for admins on deep validation", async () => {
    const admin = await settle(apiLogin("admin@bridge.demo", "demo1234"));
    const { record } = await settle(apiValidate(admin, "maya.chen@stripe.com"));
    expect(record.mode).toBe("deep");
    const fresh = await settle(fetchSessionUser());
    expect(fresh?.credits).toBe(99999);
  });

  it("should reject deep validation when credits exhausted", async () => {
    const u = await settle(apiSignup("Broke2", "broke2@x.io", "password123"));
    await settle(apiAdminPatchUser(u.id, { credits: 0 }));
    await expect(settle(apiValidate(u, "maya.chen@stripe.com"))).rejects.toMatchObject({ code: "credits" });
  });

  it("should enforce rate limit on deep validations too", async () => {
    const u = await settle(apiSignup("RateDeep", "ratedeep@x.io", "password123"));
    for (let i = 0; i < RATE_LIMIT_PER_MIN; i++) {
      await settle(apiValidate(u, `user${i}@stripe.com`, { quick: true }));
    }
    await expect(settle(apiValidate(u, "one-more@stripe.com"))).rejects.toMatchObject({ code: "rate" });
  });
});
