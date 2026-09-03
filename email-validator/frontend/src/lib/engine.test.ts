import { describe, it, expect } from "vitest";
import {
  DISPOSABLE_SEED,
  LAYERS,
  domainReport,
  judge,
  judgeQuick,
  parseEmailList,
  toCSV,
  type EngineOptions,
  type LayerKey,
  type Verdict,
} from "./engine";

const fullOn: EngineOptions = {
  blocklist: [...DISPOSABLE_SEED],
  enabled: {
    syntax: true,
    dns: true,
    mx: true,
    disposable: true,
    catchall: true,
    smtp: true,
    scoring: true,
  },
};

const statusOf = (v: Verdict, key: LayerKey) => v.layers.find((l) => l.key === key)!.status;

describe("engine · judge (deep 7-layer)", () => {
  it("should be deterministic — same address yields identical verdict", () => {
    const a = judge("maya.chen@stripe.com", fullOn);
    const b = judge("maya.chen@stripe.com", fullOn);
    expect(b.score).toBe(a.score);
    expect(b.status).toBe(a.status);
    expect(b.layers.map((l) => l.status)).toEqual(a.layers.map((l) => l.status));
  });

  it("should pass all layers and return valid for a healthy selective domain", () => {
    const v = judge("maya.chen@stripe.com", fullOn);
    expect(v.layers).toHaveLength(7);
    expect(v.status).toBe("valid");
    expect(v.action).toBe("Safe to send");
    expect(v.score).toBeGreaterThanOrEqual(75);
    for (const l of LAYERS) expect(statusOf(v, l.key)).toBe("pass");
    expect(v.totalMs).toBeGreaterThan(0);
    expect(v.domain).toBe("stripe.com");
  });

  it("should fail at DNS with a typo suggestion and early-exit remaining layers", () => {
    const v = judge("james@gmial.com", fullOn);
    expect(statusOf(v, "syntax")).toBe("pass");
    expect(statusOf(v, "dns")).toBe("fail");
    expect(v.layers.find((l) => l.key === "dns")!.note).toContain("gmail.com");
    expect(statusOf(v, "mx")).toBe("skip");
    expect(statusOf(v, "smtp")).toBe("skip");
    expect(statusOf(v, "scoring")).toBe("pass"); // early-exit scoring still runs
    expect(v.status).toBe("invalid");
    expect(v.score).toBeLessThan(40);
  });

  it("should fail at Layer 4 for a blocklisted disposable domain", () => {
    const v = judge("promo@mailinator.com", fullOn);
    expect(statusOf(v, "disposable")).toBe("fail");
    expect(statusOf(v, "catchall")).toBe("skip");
    expect(v.status).toBe("invalid");
  });

  it("should warn on catch-all domains and land in the risky band", () => {
    const v = judge("info@megacorp.com", fullOn);
    expect(statusOf(v, "catchall")).toBe("warn");
    expect(v.status).toBe("risky");
    expect(v.score).toBeGreaterThanOrEqual(40);
    expect(v.score).toBeLessThan(75);
    expect(v.action).toContain("review");
  });

  it("should fail at syntax for a malformed address", () => {
    const v = judge("plainaddress", fullOn);
    expect(statusOf(v, "syntax")).toBe("fail");
    expect(v.status).toBe("invalid");
  });

  it("should mark disabled layers as off and skip their influence", () => {
    const opts: EngineOptions = { ...fullOn, enabled: { ...fullOn.enabled, smtp: false } };
    const v = judge("maya.chen@stripe.com", opts);
    expect(statusOf(v, "smtp")).toBe("off");
    expect(statusOf(v, "syntax")).toBe("pass");
  });

  it("should respect admin blocklist additions", () => {
    const opts: EngineOptions = { ...fullOn, blocklist: [...DISPOSABLE_SEED, "burner.test"] };
    const v = judge("x@burner.test", opts);
    expect(statusOf(v, "disposable")).toBe("fail");
    expect(v.status).toBe("invalid");
  });
});

describe("engine · judgeQuick", () => {
  it("should run only syntax + DNS and return a provisional pass", () => {
    const v = judgeQuick("ok@stripe.com", fullOn);
    expect(statusOf(v, "syntax")).toBe("pass");
    expect(statusOf(v, "dns")).toBe("pass");
    expect(statusOf(v, "mx")).toBe("skip");
    expect(statusOf(v, "scoring")).toBe("skip");
    expect(v.status).toBe("valid");
    expect(v.score).toBe(62);
  });

  it("should return invalid when DNS fails", () => {
    const v = judgeQuick("bad@gmial.com", fullOn);
    expect(statusOf(v, "dns")).toBe("fail");
    expect(v.status).toBe("invalid");
    expect(v.score).toBe(6);
  });
});

describe("engine · domainReport", () => {
  it("should return curated records for a known provider", () => {
    const r = domainReport("gmail.com");
    expect(r.exists).toBe(true);
    expect(r.mx.some((m) => m.host === "gmail-smtp-in.l.google.com")).toBe(true);
    expect(r.dmarc?.policy).toBe("none");
    expect(r.dkim[0]).toMatchObject({ selector: "google", bits: 2048, valid: true });
    expect(r.score).toBeGreaterThan(0);
  });

  it("should report strong posture for strict SPF + reject DMARC", () => {
    const r = domainReport("outlook.com");
    expect(r.spf?.strict).toBe(true);
    expect(r.dmarc?.policy).toBe("reject");
    expect(r.score).toBeGreaterThanOrEqual(80);
  });

  it("should suggest a correction for typo domains", () => {
    const r = domainReport("gmial.com");
    expect(r.exists).toBe(false);
    expect(r.suggestion).toBe("gmail.com");
  });

  it("should return NXDOMAIN for dead domains and reject invalid input", () => {
    expect(domainReport("dead.corp.io").exists).toBe(false);
    expect(domainReport("not a domain").verdict).toBe("Not a valid domain name");
  });

  it("should be deterministic for generic domains", () => {
    const a = domainReport("meridian-analytics.io");
    const b = domainReport("meridian-analytics.io");
    expect(b).toEqual(a);
  });
});

describe("engine · csv helpers", () => {
  it("should parse, lowercase and dedupe mixed separators", () => {
    const out = parseEmailList("A@B.co, c@d.io\na@b.co;e@f.io\n");
    expect(out).toEqual(["a@b.co", "c@d.io", "e@f.io"]);
  });

  it("should escape quotes and commas in CSV output", () => {
    const csv = toCSV(["email", "note"], [["x@y.io", 'say "hi", ok']]);
    expect(csv.split("\n")[0]).toBe("email,note");
    expect(csv.split("\n")[1]).toBe('x@y.io,"say ""hi"", ok"');
  });
});
