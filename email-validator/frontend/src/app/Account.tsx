import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Icon } from "../lib/ui";
import { useAuth } from "../lib/auth";
import {
  apiChangePassword,
  apiCreateKey,
  apiListKeys,
  apiRevokeKey,
  apiUpdateProfile,
  ApiError,
  type ApiKey,
} from "../lib/db";
import { Card, Confirm, CopyBtn, Field, inputCls, Modal, PrimaryButton, GhostButton, useToast } from "./ui";
import { timeAgo } from "./Layers";
import { RouteTransition } from "../lib/route-transition";

/* ================= API keys ================= */

export function ApiKeysPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [err, setErr] = useState("");
  const [fresh, setFresh] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setKeys(await apiListKeys(user.id));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || creating) return;
    setErr("");
    setCreating(true);
    try {
      const k = await apiCreateKey(user.id, label);
      setFresh(k);
      setLabel("");
      push("API key created", "ok");
      load();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Could not create key.");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async () => {
    if (!revoking) return;
    setBusy(true);
    await apiRevokeKey(revoking.id);
    setBusy(false);
    setRevoking(null);
    push("Key revoked — it can no longer authenticate", "info");
    load();
  };

  const mask = (k: string) => `${k.slice(0, 12)}…${k.slice(-4)}`;

  return (
    <RouteTransition>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <Card className="h-fit p-6">
        <h3 className="text-[15px] font-extrabold text-white">Create a key</h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-white/30">
          Keys authenticate the REST API. The full secret is shown <strong className="text-white/50">once</strong> — store it in your secret manager, not your repo.
        </p>
        <form onSubmit={create} className="mt-5 space-y-3">
          <Field label="Label" error={err}>
            <input className={inputCls} placeholder="Production — signup form" value={label} onChange={(e) => setLabel(e.target.value)} />
          </Field>
          <PrimaryButton type="submit" loading={creating} disabled={creating} className="w-full py-3">
            {creating ? "Generating…" : "Generate key"}
          </PrimaryButton>
        </form>
        <div className="mt-5 rounded-xl border border-[var(--line-secondary)] bg-[var(--bg-2)] p-4">
          <p className="font-data text-[9px] font-semibold tracking-[0.2em] text-[var(--cyan)] uppercase">quickstart</p>
          <pre className="font-data mt-2.5 overflow-x-auto text-[10.5px] leading-relaxed text-white/50">
{`curl https://api.bridgemodulx.io/v1/verify \\
  -H "Authorization: Bearer bx_live_..." \\
  -d '{"email":"maya@stripe.com"}'`}
          </pre>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-[15px] font-extrabold text-white">Your keys</h3>
        <p className="font-data mt-0.5 text-[9.5px] tracking-[0.16em] text-white/30 uppercase">
          {keys ? `${keys.filter((k) => !k.revokedAt).length} active · max 5` : "loading"}
        </p>
        <div className="mt-4 space-y-2.5">
          {!keys ? (
            [...Array(2)].map((_, i) => <div key={i} className="shimmer h-16 rounded-xl bg-[var(--bg-2)]" />)
          ) : keys.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--line)] px-5 py-8 text-center text-[12.5px] text-white/30">
              No keys yet — generate your first one on the left.
            </p>
          ) : (
            keys.map((k) => (
              <div
                key={k.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 transition-colors duration-200 ${
                  k.revokedAt ? "border-white/[0.08] opacity-55" : "border-white/[0.08] hover:border-[#D8D4C8]"
                }`}
              >
                <span className={`flex size-9 items-center justify-center rounded-lg border ${k.revokedAt ? "border-white/[0.08] text-white/30" : "border-[#111111] bg-white/[0.03] text-white"}`}>
                  <Icon name="key" size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">{k.label}</p>
                  <p className="font-data mt-0.5 truncate text-[10.5px] text-white/30">
                    {mask(k.key)} · created {timeAgo(k.createdAt)}
                    {k.lastUsedAt ? ` · used ${timeAgo(k.lastUsedAt)}` : " · never used"}
                  </p>
                </div>
                {k.revokedAt ? (
                  <span className="font-data rounded-full border border-[#EAB9BB] px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-[var(--red)] uppercase">
                    revoked
                  </span>
                ) : (
                  <>
                    <CopyBtn text={k.key} />
                    <button
                      onClick={() => setRevoking(k)}
                      className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-[11px] font-bold text-white/30 transition-colors duration-200 hover:border-[#EAB9BB] hover:text-[#9F2F2D]"
                    >
                      Revoke
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* secret shown once */}
      <Modal open={!!fresh} onClose={() => setFresh(null)} title="Key created — copy it now" width="max-w-md">
        {fresh && (
          <div>
            <p className="text-[12.5px] leading-relaxed text-white/50">
              For security, this is the <strong className="text-white">only time</strong> the full secret is shown.
            </p>
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#111111] bg-white/[0.03] p-3.5">
              <code className="font-data min-w-0 flex-1 break-all text-[11.5px] text-[var(--cyan)]">{fresh.key}</code>
              <CopyBtn text={fresh.key} label="Copy key" />
            </div>
            <button onClick={() => setFresh(null)} className="mt-5 w-full rounded-md bg-[#111111] px-4 py-2.5 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-[#333333]">
              I've stored it safely
            </button>
          </div>
        )}
      </Modal>

      <Confirm
        open={!!revoking}
        onClose={() => setRevoking(null)}
        onConfirm={revoke}
        busy={busy}
        danger
        title="Revoke this key?"
        confirmLabel="Revoke key"
        body={
          <>
            Requests signed with <span className="font-data text-[var(--cyan)]">{revoking?.label}</span> will start
            failing immediately. This can't be undone.
          </>
        }
      />
      </div>
    </RouteTransition>
  );
}

/* ================= settings ================= */

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const { push } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [profileErr, setProfileErr] = useState("");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;
    setProfileErr("");
    setSaving(true);
    try {
      await apiUpdateProfile(user.id, { name, email });
      await refresh();
      push("Profile updated", "ok");
    } catch (ex) {
      setProfileErr(ex instanceof ApiError ? ex.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const savePw = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || pwSaving) return;
    setPwErr("");
    setPwSaving(true);
    try {
      await apiChangePassword(user.id, curPw, newPw);
      setCurPw("");
      setNewPw("");
      push("Password changed", "ok");
    } catch (ex) {
      setPwErr(ex instanceof ApiError ? ex.message : "Could not change password.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <RouteTransition>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="h-fit p-6">
          <h3 className="text-[15px] font-extrabold text-white">Profile</h3>
          <p className="mt-1 text-[12.5px] text-white/30">How you appear in team workspaces and logs.</p>
          <form onSubmit={saveProfile} className="mt-5 space-y-4">
            <Field label="Full name">
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Email" hint="used for sign-in">
              <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </Field>
            {profileErr && <p role="alert" className="font-data text-[11px] text-[var(--red)]">{profileErr}</p>}
            <PrimaryButton type="submit" loading={saving} disabled={saving}>
              Save profile
            </PrimaryButton>
          </form>
        </Card>

        <Card className="h-fit p-6">
          <h3 className="text-[15px] font-extrabold text-white">Security</h3>
          <p className="mt-1 text-[12.5px] text-white/30">Rotate your password regularly — especially after key leaks.</p>
          <form onSubmit={savePw} className="mt-5 space-y-4">
            <Field label="Current password">
              <input type="password" autoComplete="current-password" className={inputCls} value={curPw} onChange={(e) => setCurPw(e.target.value)} />
            </Field>
            <Field label="New password" hint="min 8 characters">
              <input type="password" autoComplete="new-password" className={inputCls} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            </Field>
            {pwErr && <p role="alert" className="font-data text-[11px] text-[var(--red)]">{pwErr}</p>}
            <GhostButton type="submit" disabled={pwSaving}>
              Change password
            </GhostButton>
          </form>
          <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4">
            <p className="font-data text-[9px] font-semibold tracking-[0.2em] text-white/30 uppercase">demo note</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/30">
              This demo stores a salted digest in your browser only — no server, no telemetry. Real deployments hash with Argon2id server-side.
            </p>
          </div>
        </Card>
      </div>
    </RouteTransition>
  );
}
