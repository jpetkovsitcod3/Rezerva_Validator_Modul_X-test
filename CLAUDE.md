# BrainSync Project Memory

> This file is generated from `.brainsync/memory.jsonl`. Edit BrainSync memory instead of hand-editing generated sections.

- Project: Validator_Modul_X-test
- Project key: validator-modul-x-test-0d2086dc1f9d5c1c
- Full workspace path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
- Canonical source: https://github.com/sitcod3lab-git/Validator_Modul_X-test
- Generated at: 2026-08-30T23:52:35.176Z
- Memory entries available: 598

## Resume Brief

Use this context to resume the project from another IDE. Preserve the full paths when discussing files, because the same project may be open in Antigravity, Windsurf, Cursor, Cline, or another VS Code-compatible host.

## Critical Rules And Lessons

1. Operating Rules (read first) (.kiro/steering/autobuild.md)
   Kind: rule | Source: .kiro/steering/autobuild.md | Time: 2026-08-21T18:49:39.154Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Operating Rules (read first)
   1. **Never pre-create directories — just write the target file.** The write tool creates parent dirs for you, so writing `.autoclaw/autobuild/workflows/x.yaml` makes every missing folder along the way. (This is why `mkdir -p` / `touch` / `New-Item` are unnecessary *and* unreliable across Bash/PowerShell/cmd — but you don't have to reason about that: there is simply no directory step to take.)
   2. **Forward slashes in paths.** Always.
   3. **Idempotency.** `schedule` with an existing `<name>` updates the workflow in place — do not duplicate registry entries. `cancel` on a missing name reports "no such workflow" and exits cleanly.
   4. **Step commands are platform-aware.** Default templates use cross-platform npm scripts (`npm run build`, `npm test`). If a step needs a shell builtin, prefer Node/npm scripts in `package.json` over raw shell so it works on every host.
   5. **Output discipline.** Confirm in ≤3 lines: what changed, file path, next action. No reasoning narration.

2. Operating Rules (read before any sub-command) (.kiro/steering/intelligence.md)
   Kind: rule | Source: .kiro/steering/intelligence.md | Time: 2026-08-21T18:49:39.140Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Operating Rules (read before any sub-command)
   1. **Use file tools, not shell, for directories and files.** Create folders and
      files with the host's file/write tool (e.g. Write, create_file, edit_file). Do
      NOT use `mkdir -p`, `touch`, `New-Item`, or shell redirection — they fail
      across the Bash/PowerShell/cmd.exe mix you may be running on. If you must shell
      out, detect the platform first.
   2. **Always use forward slashes in paths** (e.g. `.autoclaw/vector/config.json`).
      Node, git, and every supported shell accept them.
   3. **Be idempotent.** Creating a contract directory that already exists is a
      no-op. Never overwrite `.autoclaw/kdream/memory/MEMORY.md` or
      `preferences.json` — append or merge only.
   4. **Output discipline.** When confirming an action, output ≤3 short lines: what
      was done, current counts, next step. Do not narrate your reasoning, repeat
      headings, or invent style rules. No emojis unless the user asked.
   5. **Never invent files, sessions, learnings, or metrics.** Only report what you
      actually read from disk. If a store is empty or a command is unimplemented,
      say so plainly.
   6. **Local-only and consent-first.** Third-party session sources are opt-in;
      AutoClaw-native logs are on by default. Redact secrets/PII before embedding,
      storing, or logging.

3. Operating Rules (read before any sub-command) (.kiro/steering/kdream.md)
   Kind: rule | Source: .kiro/steering/kdream.md | Time: 2026-08-21T18:49:39.133Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Operating Rules (read before any sub-command)
   1. **Use file tools, not shell, for directories and files.** Create folders and files with the host's file/write tool (e.g. Write, create_file, edit_file). Do NOT use `mkdir -p`, `touch`, `New-Item`, or shell redirection — they fail across the Bash/PowerShell/cmd.exe mix you may be running on. If you must shell out, detect the platform first and use `mkdir` (no `-p`) on Windows cmd, or `New-Item -ItemType Directory -Force` in PowerShell.
   2. **Always use forward slashes in paths** (e.g. `.autoclaw/kdream/state.json`). Node, git, and every supported shell accept them.
   3. **Be idempotent.** Before running `start`, read `.autoclaw/kdream/state.json`. If `status == "running"`, do NOT recreate directories or rewrite state — just run a fresh tick and report current status.
   4. **Output discipline.** When confirming an action, output ≤3 short lines: what was done, current counts (ticks/TODOs/follow-ups), next step. Do NOT narrate your reasoning, repeat headings, or invent style rules ("titles must be gerunds", etc.). No emojis unless the user asked.
   5. **Never invent files, follow-ups, or commits.** Only report what you actually read from disk or git.

4. Operating Rules (read first) (.kiro/steering/orchestrate.md)
   Kind: rule | Source: .kiro/steering/orchestrate.md | Time: 2026-08-21T18:49:39.123Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Operating Rules (read first)
   1. **Use file tools, not shell, for directories and files.** Create `.autoclaw/orchestrator/...` paths with the host's file/write tool. Do NOT use `mkdir -p`, `touch`, or `New-Item`.
   2. **Forward slashes in paths.** Always.
   3. **Idempotency.** `plan` with an existing manifest re-generates sprints in place. `assign` on an already-assigned sprint updates the assignment.
   4. **Scope isolation is sacred.** Never assign overlapping file scopes to parallel agents in the same sprint. The planner MUST detect and prevent conflicts.
   5. **Output discipline.** Confirm in ≤5 lines: what changed, sprint count, agent assignments, next action. No reasoning narration.

5. inclusion: auto (.kiro/steering/doc-writer.md)
   Kind: rule | Source: .kiro/steering/doc-writer.md | Time: 2026-08-21T18:49:39.322Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   ---
   inclusion: auto
   name: doc-writer
   description: Keeps user-facing docs in sync with public-API changes. Triggered by /persona doc-writer and auto-dispatched on a task_complete whose diff touches a public API (exported types, command contributions, MCP tools, CLI flags). Writes only docs + CHANGELOG; never code. Reads its persona memory so doc conventions accumulate. Local-first provider with cloud fallback.
   ---

6. Pattern: Report-Only (Safe Default) (.kiro/steering/autobuild.md)
   Kind: rule | Source: .kiro/steering/autobuild.md | Time: 2026-08-21T18:49:39.156Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Pattern: Report-Only (Safe Default)
   ```yaml
   name: health-check
   cron: "*/30 * * * *"
   steps:
     - id: check
       run: npm run doctor
       mode: report    # never modifies files, guard not needed
   ```
   
   **Rule of thumb:** Use `mode: report` unless the step intentionally mutates files. Use `mode: fix` with a `guard` when the step should change code and you want automatic rollback on failure.

7. schedule — Create a Scheduled Workflow (.kiro/steering/autobuild.md)
   Kind: rule | Source: .kiro/steering/autobuild.md | Time: 2026-08-21T18:49:39.155Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   schedule — Create a Scheduled Workflow
   1. Parse the cron expression and workflow name from the user's input.
   2. **Infer a real default step set from the name** — never ship a placeholder
      the user must remember to replace. Match the name (case-insensitive)
      against these, first hit wins; if several apply, include each matching step:
      | Name contains | Default step(s) |
      |---|---|
      | `inbox` / `sweep` / `triage` | `id: inbox-sweep`, `mode: report`, `run: npm run autoclaw -- inbox sweep` (or, if no such script, a report-only doctor pass) |
      | `lint` | `id: lint`, `run: npm run lint` |
      | `test` | `id: test`, `run: npm test` |
      | `build` | `id: build`, `run: npm run build` |
      | `deploy` / `release` | `id: build`+`id: test`+`id: deploy` (deploy gated on `{{test.exit_code}} == 0`) |
      | `health` / `doctor` / `check` | `id: check`, `mode: report`, `run: npm run doctor` |
      | none of the above | a single `mode: report` step that runs the project's most relevant npm script; if none is obvious, leave `steps: []` and set status `draft` |
   3. Create `.autoclaw/autobuild/workflows/<name>.yaml`. Example for a `nightly-test` workflow:
      ```yaml
      name: <name>
      cron: "<expression>"
      created: <ISO timestamp>
      steps:
        - id: test
          run: npm test
      notify: true
      ```
   4. Register it in `.autoclaw/autobuild/registry.json` (create if missing). Set
      `status` to **`draft`** when the workflow has no concrete steps (empty
      `steps:` or any step you couldn't resolve to a real command), otherwise
      `scheduled`. A `draft` workflow is NOT fired by the scheduler — it is parked
      until its steps are real.
      ```json
      { "workflows": [{ "name": "<name>", "cron": "<expr>", "lastRun": null, "status": "scheduled" }] }
      ```
   5. Confirm: "Workflow `<name>` scheduled (`<cron>`) with N step(s): <ids>. Edit `.autoclaw/autobuild/workflows/<name>.yaml` to refine." — and if `status: draft`, say so plainly: "parked as **draft** (no concrete steps yet) — it will not run until you add real steps."

8. Step conditions (.kiro/steering/autobuild.md)
   Kind: rule | Source: .kiro/steering/autobuild.md | Time: 2026-08-21T18:49:39.155Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Step conditions
   A step's optional `condition` gates whether it runs, evaluated against earlier
   steps' results. A step **without** a condition keeps the default behaviour: it is
   skipped once any earlier step fails. A step **with** a condition runs whenever the
   condition is true — even after an earlier failure (e.g. a notify-on-failure
   step) — and is skipped (without aborting the rest of the run) when it is false or
   cannot be evaluated.

9. Boundaries (never violate) (.kiro/steering/doc-writer.md)
   Kind: rule | Source: .kiro/steering/doc-writer.md | Time: 2026-08-21T18:49:39.145Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Boundaries (never violate)
   1. **Docs + CHANGELOG only.** Never edit `src/`, tests, or config beyond the
      doc surface. If the code is wrong, file a `finding_report`.
   2. **Never document the unshipped.** If a feature is gated/inert (e.g. an
      opt-in GA path), say so explicitly — don't imply it's on by default.
   3. **No secret/endpoint leakage** into examples; mark such memory `project`.

10. Mission (.kiro/steering/doc-writer.md)
   Kind: rule | Source: .kiro/steering/doc-writer.md | Time: 2026-08-21T18:49:39.144Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Mission
   Keep the docs honest. When a public surface changes, the docs change in the
   same beat — not a sprint later. Describe behaviour in plain words (the user
   doesn't read TypeScript), and never document a capability that isn't shipped.

11. On-disk contract (.kiro/steering/intelligence.md)
   Kind: rule | Source: .kiro/steering/intelligence.md | Time: 2026-08-21T18:49:39.140Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   On-disk contract
   The layer owns only paths under `.autoclaw/` and never collides with `.cursor/`,
   `CLAUDE.md`, or other tools:
   
   ```
   .autoclaw/vector/      config.json, db.sqlite, last-index.json
   .autoclaw/learnings/   distilled learnings
   .autoclaw/metrics/     token/usage metrics
   .autoclaw/history/     per-source extraction watermarks
   .autoclaw/.locks/      advisory file locks
   .autoclaw/kdream/memory/MEMORY.md   owned by KDream — appended, never overwritten
   ```
   
   Generated data (`db.sqlite`, `.locks/`, `history/`) is gitignored.

12. Operating Rules (read first) (.kiro/steering/mateam.md)
   Kind: rule | Source: .kiro/steering/mateam.md | Time: 2026-08-21T18:49:39.128Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Operating Rules (read first)
   1. **Use file tools, not shell, for the scratchpad.** Create `.autoclaw/mateam/scratch/<session>/...` and its files with the host's file/write tool — never `mkdir -p`/`touch`/`New-Item`.
   2. **Forward slashes in paths.** Always.
   3. **Roles are sequential by default**, but Researcher steps that read independent files MAY be issued as parallel tool calls. Coder waits for Researcher; Reviewer waits for Coder; Verifier waits for Reviewer.
   4. **One scratchpad per session.** Re-using a session ID without `cancel`-ing the prior session is an error — append `-2`, `-3`, etc., or pick a new slug.
   5. **Output discipline.** The final report is ≤6 lines: what shipped, key review concerns, test/build result, scratchpad path. No reasoning narration, no per-role transcripts.

13. Host detection & dispatch (.kiro/steering/mateam.md)
   Kind: rule | Source: .kiro/steering/mateam.md | Time: 2026-08-21T18:49:39.128Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Host detection & dispatch
   **Hard rule:** if you invent an `Agent` invocation when the host has no such tool, that is a critical failure. Halt and tell the user the host lacks subagents and you ran in-session instead.

14. Inputs you must load (.kiro/steering/security-auditor.md)
   Kind: rule | Source: .kiro/steering/security-auditor.md | Time: 2026-08-21T18:49:39.118Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Inputs you must load
   `docs/research/` security write-ups (seeded patterns).

15. Inputs you must load (.kiro/steering/security-auditor.md)
   Kind: rule | Source: .kiro/steering/security-auditor.md | Time: 2026-08-21T18:49:39.118Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Inputs you must load
   Your persona memory under `.autoclaw/memory/personas/security-auditor/`

16. Boundaries (never violate) (.kiro/steering/security-auditor.md)
   Kind: rule | Source: .kiro/steering/security-auditor.md | Time: 2026-08-21T18:49:39.118Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Boundaries (never violate)
   1. **Read-only outside `reviews/`.** Never edit `src/` to "just fix it" — file
      the finding; the owning persona/agent fixes it in its own scope.
   2. **Unanimous on security findings.** A security-tier item needs *every*
      reviewer to approve before merge — a 2/3 majority is not enough here.
   3. **Never weaken an invariant to make a test pass.** Inert-by-default,
      token-only-in-Authorization-header, encrypt-before-queue are load-bearing.
   4. **Never paste a real secret into the report.** Redact; cite the location.

17. Mission (.kiro/steering/security-auditor.md)
   Kind: rule | Source: .kiro/steering/security-auditor.md | Time: 2026-08-21T18:49:39.117Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Mission
   Find the security defects that matter before they ship, and gate the
   security-tier merges (the unanimous-vote rule). Audit against a concrete
   threat model — never a vibe check. Produce a structured finding report that a
   peer can vote on and an implementer can close item by item. Read your own
   prior findings first so a re-audit accumulates instead of re-discovering.

18. When invoked (.kiro/steering/security-auditor.md)
   Kind: rule | Source: .kiro/steering/security-auditor.md | Time: 2026-08-21T18:49:39.117Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   When invoked
   1. **By the user**: `/persona security-auditor "audit <path>"`.
   2. **By `/sprint`**: when a task brief or diff touches auth, crypto, network
      egress, secrets, file paths, or a `tier: ga` flip.
   3. **Before a GA gate**: a security-tier task (e.g. cloud relay GA) must not
      merge without an audit + unanimous sign-off.

19. Message Types (.cursor/rules/cross-agent.mdc)
   Kind: rule | Source: .cursor/rules/cross-agent.mdc | Time: 2026-08-21T18:49:38.758Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Message Types
   `finding_report` — A security or quality finding

20. Consensus Protocol (.cursor/rules/cross-agent.mdc)
   Kind: rule | Source: .cursor/rules/cross-agent.mdc | Time: 2026-08-21T18:49:38.758Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Consensus Protocol
   Tasks require **2/3 majority** approval from assigned agents. Security findings require **unanimous** approval.
   
   To vote, write a vote file to: `consensus/active/{task_id}-cursor.json`
   
   Vote structure:
   ```json
   {
     "voter": "cursor",
     "task_id": "task-123",
     "vote": "approve",
     "timestamp": "2025-01-15T10:30:00Z",
     "comments": "Looks good. Tests pass."
   }
   ```
   
   Valid votes: `approve`, `reject`, `request_changes`

21. description: Keeps user-facing docs in sync with public-API changes. Triggered by /persona d (.cursor/rules/doc-writer.mdc)
   Kind: rule | Source: .cursor/rules/doc-writer.mdc | Time: 2026-08-21T18:49:38.743Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   ---
   description: Keeps user-facing docs in sync with public-API changes. Triggered by /persona doc-writer and auto-dispatched on a task_complete whose diff touches a public API (exported types, command contributions, MCP tools, CLI flags). Writes only docs + CHANGELOG; never code. Reads its persona memory so doc conventions accumulate. Local-first provider with cloud fallback.
   alwaysApply: false
   ---

22. Outputs you produce (.cursor/rules/security-auditor.mdc)
   Kind: rule | Source: .cursor/rules/security-auditor.mdc | Time: 2026-08-21T18:49:38.736Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Outputs you produce
   `reviews/<target>-security-audit.md` — the structured report (see exemplar).

23. Outputs you produce (.cursor/rules/security-auditor.mdc)
   Kind: rule | Source: .cursor/rules/security-auditor.mdc | Time: 2026-08-21T18:49:38.736Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Outputs you produce
   A `finding_report` to the orchestrator for each HIGH/critical item.

24. What "good" looks like (.cursor/rules/security-auditor.mdc)
   Kind: rule | Source: .cursor/rules/security-auditor.mdc | Time: 2026-08-21T18:49:38.736Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   What "good" looks like
   See the exemplar [reviews/cloud-relay-security-audit.md](../../reviews/cloud-relay-security-audit.md):
   a stated method + threat model, severity-ranked findings with file refs and
   concrete fixes, a separation of must-fix (blocking) from accept-with-docs, and
   a Resolution table the implementer's CF-4 walk consumes.

25. description: Audits a target module for security defects against a seeded pattern set, write (.cursor/rules/security-auditor.mdc)
   Kind: rule | Source: .cursor/rules/security-auditor.mdc | Time: 2026-08-21T18:49:38.735Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   ---
   description: Audits a target module for security defects against a seeded pattern set, writes a structured finding report with severity + disposition, and gates security-tier merges. Triggered by /persona security-auditor, by /sprint when a task touches auth/crypto/network/secrets, and before any GA flip. Reads prior findings from its persona memory so a re-audit picks up where the last left off. Local-first provider with cloud fallback.
   alwaysApply: false
   ---

26. Step 1 — Decompose the Task (.cursor/rules/mateam.mdc)
   Kind: rule | Source: .cursor/rules/mateam.mdc | Time: 2026-08-21T18:49:38.715Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Step 1 — Decompose the Task
   Break the user's task into parallel workstreams. Standard roles:
   
   | Role | Responsibility |
   |---|---|
   | **Researcher** | Gathers context: reads relevant files, searches codebase, identifies dependencies |
   | **Coder** | Implements changes based on Researcher's findings |
   | **Reviewer** | Audits Coder's output for correctness, security, and style |
   | **Verifier** | Runs tests, checks build, confirms acceptance criteria are met |
   
   Assign only the roles the task requires. Small tasks may need only Researcher + Coder.

27. Step 3 — Execute Roles in Order (.cursor/rules/mateam.mdc)
   Kind: rule | Source: .cursor/rules/mateam.mdc | Time: 2026-08-21T18:49:38.715Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Step 3 — Execute Roles in Order
   Check for: logic errors, security issues, style inconsistencies, missing edge cases.

28. status — Show Progress (.cursor/rules/orchestrate.mdc)
   Kind: rule | Source: .cursor/rules/orchestrate.mdc | Time: 2026-08-21T18:49:38.688Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   status — Show Progress
   Read all sprint YAMLs and the plan summary. Display:
   
   ```
   Orchestration Status — {project}
   ═══════════════════════════════
   Sprint 1: ██████████ merged (4/4 tasks)
   Sprint 2: ████████░░ in_progress (WA-1: done, WA-2: review, WA-3: working, WA-4: working)
   Sprint 3: ░░░░░░░░░░ pending (blocked by Sprint 2)
   ...
   Progress: 12/75 tasks complete (16%)
   Critical path: Sprint 5 of 9
   ```
   
   **Then, append a Stalled-agents section.** Read every file under
   `.autoclaw/orchestrator/comms/heartbeats/` and compare its `timestamp`
   to the registry's `agents.heartbeat_stall_seconds` (default `300`):
   
   ```
   Stalled agents:
     kiro                — last heartbeat 3d 14h ago (2026-05-20T19:36Z) — REMOVED from rotation
     claude-code-desktop — last heartbeat 19h    ago (2026-05-22T14:10Z) — run `/orchestrate revive claude-code-desktop`
   ```
   
   Threshold for "REMOVED from rotation" is `agents.heartbeat_stall_seconds × 100`
   (i.e. ~8h with the default 300s). Below that, recommend `/orchestrate revive`.
   No stalls → omit the section.
   
   ---

29. Plan Summary Format (.cursor/rules/orchestrate.mdc)
   Kind: rule | Source: .cursor/rules/orchestrate.mdc | Time: 2026-08-21T18:49:38.687Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Plan Summary Format
   ```yaml
   project: "zippypanel"
   total_tasks: 75
   total_sprints: 9
   total_agents: 4
   critical_path_length: 5
   estimated_total_days: 36
   sprints:
     - number: 1
       level: 0
       tasks: 4
       agents: [WA-1, WA-2, WA-3, WA-4]
       status: pending
   ```
   
   Confirm: "Generated {N} sprints for {M} tasks across {A} agents. Critical path: {P} sprints. Run `/orchestrate assign 1` to start Sprint 1."
   
   ---

30. Algorithm (.cursor/rules/orchestrate.mdc)
   Kind: rule | Source: .cursor/rules/orchestrate.mdc | Time: 2026-08-21T18:49:38.686Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Algorithm
   1. Critical path length (longest downstream chain first)
     2. Downstream dependents (unblocks most tasks)
     3. Effort (larger tasks start early to avoid tail latency)
     4. Affinity (co-locate related tasks)
   
   **Phase 6: Migration Range Allocation**

31. Algorithm (.cursor/rules/orchestrate.mdc)
   Kind: rule | Source: .cursor/rules/orchestrate.mdc | Time: 2026-08-21T18:49:38.685Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Algorithm
   `required_capabilities` (optional, defaults to `[]`) is a list of capability tags (e.g. `["go", "security-review"]`) consumed by the capability-aware router. Manifests without this field continue to plan exactly as before.

32. Consensus Protocol (.windsurf/rules/cross-agent.md)
   Kind: rule | Source: .windsurf/rules/cross-agent.md | Time: 2026-08-21T18:49:37.651Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Consensus Protocol
   Tasks require **2/3 majority** approval from assigned agents. Security findings require **unanimous** approval.
   
   To vote, write a vote file to: `consensus/active/{task_id}-windsurf.json`
   
   Vote structure:
   ```json
   {
     "voter": "windsurf",
     "task_id": "task-123",
     "vote": "approve",
     "timestamp": "2025-01-15T10:30:00Z",
     "comments": "Looks good. Tests pass."
   }
   ```
   
   Valid votes: `approve`, `reject`, `request_changes`

33. 5. Update state (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.722Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   5. Update state
   Increment `tick` in `state.json`. Save current todo list snapshot.
   If `tick % 20 == 0` or last dream >24h ago → trigger **autoDream**.
   
   ---

34. todo — List Open Items (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.722Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   todo — List Open Items
   1. Read current `todos` array from `state.json`.
   2. Read open `- [ ]` items from `MEMORY.md ## Follow-ups`.
   3. Report both lists clearly, grouped by source (code TODOs vs manual follow-ups).

35. work — Act on an Item (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.722Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   work — Act on an Item
   When the user runs `/kdream work <item description or number>`:
   1. **Dispatch.** If the host exposes a tool literally named `Agent` (Claude Code), spawn a coder subagent scoped to this single item with a short, self-contained prompt and the relevant file paths. Otherwise (Copilot, Cursor, Cline, Kilo, Continue, Antigravity, Windsurf, Kiro, etc.) work the item in-session yourself — do NOT fabricate an `Agent` call. Small items (one-file edits, doc tweaks) MAY be done in-session even when `Agent` is available, to avoid spawn overhead; items spanning ≥3 files or requiring a research pass SHOULD use `Agent`.
   2. Identify the matching TODO/FIXME or follow-up item.
   3. Read the relevant file(s) and context.
   4. Implement or resolve the item using available tools.
   5. Mark the follow-up as `- [x]` in `MEMORY.md` or confirm the code change.
   6. Log the action taken.
   
   Steps 2–5 apply regardless of which dispatch path was taken.
   
   ---

36. ps — Status (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.722Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   ps — Status
   Number of open TODOs tracked

37. Phase 2 — Gather (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.722Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Phase 2 — Gather
   `[NEW TODO]` entries → add to Facts if not already there

38. start — Launch Daemon (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.721Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   start — Launch Daemon
   2. Write `.autoclaw/kdream/state.json` using the file/write tool:
      ```json
      { "status": "running", "started": "<ISO timestamp>", "tick": 0, "lastDream": null, "todos": [] }
      ```
   3. Create `.autoclaw/kdream/memory/MEMORY.md` if missing with this structure:
      ```markdown
      # KDream Memory
   
      ## Follow-ups
      <!-- KDream checks this section on every tick. Add tasks here. -->
   
      ## Facts
      <!-- Consolidated knowledge about this workspace. -->
   
      ## Observations
      <!-- Notable events and patterns observed over time. -->
      ```
   4. Append to today's log (`.autoclaw/kdream/logs/YYYY-MM-DD.md`):
      ```
      [HH:MM:SS] KDream started. Workspace: <cwd>
      ```
   5. Run the first **tick** immediately (see Tick Cycle below).
   6. Inform the user with a single concise block — for example:
      ```
      KDream started. Tick 1.
      Git: <N> uncommitted, <M> commits today.
      TODOs: <K>. Follow-ups: <J>. No autoDream yet.
      Add tasks with /kdream add <note> or in MEMORY.md ## Follow-ups.
      ```
      Adapt counts to reality. No extra prose, no headings, no style commentary.
   
   ---

39. 2. Scan TODO/FIXME items (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.721Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   2. Scan TODO/FIXME items
   Glob all source files for lines matching `TODO`, `FIXME`, `HACK`, `XXX`, `BUG`.

40. 2. Scan TODO/FIXME items (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.721Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   2. Scan TODO/FIXME items
   For each match: record file path, line number, and comment text.

41. 2. Scan TODO/FIXME items (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.721Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   2. Scan TODO/FIXME items
   Compare against previous tick's list (stored in `state.json` under `"todos"`).

42. 2. Scan TODO/FIXME items (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.721Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   2. Scan TODO/FIXME items
   New items since last tick → log `[NEW TODO] <file>:<line> — <text>` and notify user.

43. 2. Scan TODO/FIXME items (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.721Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   2. Scan TODO/FIXME items
   Resolved items (present last tick, gone now) → log `[RESOLVED] <file>:<line>` and update memory.

44. 2. Scan TODO/FIXME items (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.721Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   2. Scan TODO/FIXME items
   Update `state.json` with current todo list.

45. 3. Check MEMORY.md follow-ups (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.721Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   3. Check MEMORY.md follow-ups
   Lines starting with `- [x]` are done → move to `## Observations` during next autoDream.

46. On Invocation (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.720Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   On Invocation
   `todo` → **List all open TODO/FIXME items found in workspace**

47. On Invocation (.cursor/rules/kdream.mdc)
   Kind: rule | Source: .cursor/rules/kdream.mdc | Time: 2026-08-21T18:49:38.720Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   On Invocation
   `work <item>` → **Actively work on a specific TODO or follow-up item**

48. assign — Assign Sprint to Agents (.cursor/rules/orchestrate.mdc)
   Kind: rule | Source: .cursor/rules/orchestrate.mdc | Time: 2026-08-21T18:49:38.688Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   assign — Assign Sprint to Agents
   4. Update sprint status to `assigned`.
   5. When broadcasting the `task_assign` message, attach the pack summary under
      `payload.intelligence` (the JSON the generator printed, including
      `context_file`) so MCP-aware runners can pull it without re-reading the brief.
   6. Confirm: "Sprint {N} assigned to {agents}. Assignment + context packs written. Each agent should read their assignment (and its context pack) and begin work."
   
   **Stalled-agent handling.** If any WA-N slot is mapped to an agent whose last heartbeat is older than `autoclaw.orchestrate.heartbeatStallSeconds` (default `300`), the assign step skips that slot's task and emits a `sprint-{N}-stalled.json` sidecar next to the sprint YAML listing the excluded slots. Surface this to the user verbatim and suggest re-running `/orchestrate assign {N}` once the stalled agent recovers.
   
   ---

49. On Invocation (.cursor/rules/orchestrate.mdc)
   Kind: rule | Source: .cursor/rules/orchestrate.mdc | Time: 2026-08-21T18:49:38.684Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   On Invocation
   `next` → **Assign the next available sprint**

50. inclusion: auto (.kiro/steering/cross-agent.md)
   Kind: rule | Source: .kiro/steering/cross-agent.md | Time: 2026-08-21T18:49:39.327Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   ---
   inclusion: auto
   name: cross-agent
   description: Cross-agent coordination protocol for multi-agent teams. Always loaded to ensure mailbox checking on every task. You are agent "kiro".
   ---

## Decisions And Checkpoints

1. name: doc-writer (.windsurf/rules/doc-writer.md)
   Kind: decision | Source: .windsurf/rules/doc-writer.md | Time: 2026-08-21T18:49:37.598Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   ---
   name: doc-writer
   description: Keeps user-facing docs in sync with public-API changes. Triggered by /persona doc-writer and auto-dispatched on a task_complete whose diff touches a public API (exported types, command contributions, MCP tools, CLI flags). Writes only docs + CHANGELOG; never code. Reads its persona memory so doc conventions accumulate. Local-first provider with cloud fallback.
   trigger: model_decision
   ---

2. name: security-auditor (.windsurf/rules/security-auditor.md)
   Kind: decision | Source: .windsurf/rules/security-auditor.md | Time: 2026-08-21T18:49:36.794Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   ---
   name: security-auditor
   description: Audits a target module for security defects against a seeded pattern set, writes a structured finding report with severity + disposition, and gates security-tier merges. Triggered by /persona security-auditor, by /sprint when a task touches auth/crypto/network/secrets, and before any GA flip. Reads prior findings from its persona memory so a re-audit picks up where the last left off. Local-first provider with cloud fallback.
   trigger: model_decision
   ---

## Conversation State

- No entries yet.

## Project Notes

1. status — Show Progress (.kiro/steering/orchestrate.md)
   Kind: note | Source: .kiro/steering/orchestrate.md | Time: 2026-08-21T18:49:39.338Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   status — Show Progress
   Read all sprint YAMLs and the plan summary. Display:
   
   ```
   Orchestration Status — {project}
   ═══════════════════════════════
   Sprint 1: ██████████ merged (4/4 tasks)
   Sprint 2: ████████░░ in_progress (WA-1: done, WA-2: review, WA-3: working, WA-4: working)
   Sprint 3: ░░░░░░░░░░ pending (blocked by Sprint 2)
   ...
   Progress: 12/75 tasks complete (16%)
   Critical path: Sprint 5 of 9
   ```
   
   **Then, append a Stalled-agents section.** Read every file under
   `.autoclaw/orchestrator/comms/heartbeats/` and compare its `timestamp`
   to the registry's `agents.heartbeat_stall_seconds` (default `300`):
   
   ```
   Stalled agents:
     kiro                — last heartbeat 3d 14h ago (2026-05-20T19:36Z) — REMOVED from rotation
     claude-code-desktop — last heartbeat 19h    ago (2026-05-22T14:10Z) — run `/orchestrate revive claude-code-desktop`
   ```
   
   Threshold for "REMOVED from rotation" is `agents.heartbeat_stall_seconds × 100`
   (i.e. ~8h with the default 300s). Below that, recommend `/orchestrate revive`.
   No stalls → omit the section.
   
   ---

2. Algorithm (.kiro/steering/orchestrate.md)
   Kind: note | Source: .kiro/steering/orchestrate.md | Time: 2026-08-21T18:49:39.337Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Algorithm
   1. Critical path length (longest downstream chain first)
     2. Downstream dependents (unblocks most tasks)
     3. Effort (larger tasks start early to avoid tail latency)
     4. Affinity (co-locate related tasks)
   
   **Phase 6: Migration Range Allocation**

3. Plan Summary Format (.kiro/steering/orchestrate.md)
   Kind: note | Source: .kiro/steering/orchestrate.md | Time: 2026-08-21T18:49:39.337Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Plan Summary Format
   ```yaml
   project: "zippypanel"
   total_tasks: 75
   total_sprints: 9
   total_agents: 4
   critical_path_length: 5
   estimated_total_days: 36
   sprints:
     - number: 1
       level: 0
       tasks: 4
       agents: [WA-1, WA-2, WA-3, WA-4]
       status: pending
   ```
   
   Confirm: "Generated {N} sprints for {M} tasks across {A} agents. Critical path: {P} sprints. Run `/orchestrate assign 1` to start Sprint 1."
   
   ---

4. Algorithm (.kiro/steering/orchestrate.md)
   Kind: note | Source: .kiro/steering/orchestrate.md | Time: 2026-08-21T18:49:39.336Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Algorithm
   `required_capabilities` (optional, defaults to `[]`) is a list of capability tags (e.g. `["go", "security-review"]`) consumed by the capability-aware router. Manifests without this field continue to plan exactly as before.

5. Message Types (.kiro/steering/cross-agent.md)
   Kind: note | Source: .kiro/steering/cross-agent.md | Time: 2026-08-21T18:49:39.328Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Message Types
   `finding_report` — A security or quality finding

6. Consensus Protocol (.kiro/steering/cross-agent.md)
   Kind: note | Source: .kiro/steering/cross-agent.md | Time: 2026-08-21T18:49:39.328Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Consensus Protocol
   Tasks require **2/3 majority** approval from assigned agents. Security findings require **unanimous** approval.
   
   To vote, write a vote file to: `consensus/active/{task_id}-kiro.json`
   
   Vote structure:
   ```json
   {
     "voter": "kiro",
     "task_id": "task-123",
     "vote": "approve",
     "timestamp": "2025-01-15T10:30:00Z",
     "comments": "Looks good. Tests pass."
   }
   ```
   
   Valid votes: `approve`, `reject`, `request_changes`

7. Step 3 — Execute Roles in Order (.kiro/steering/mateam.md)
   Kind: note | Source: .kiro/steering/mateam.md | Time: 2026-08-21T18:49:39.307Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Step 3 — Execute Roles in Order
   Check for: logic errors, security issues, style inconsistencies, missing edge cases.

8. Step 1 — Decompose the Task (.kiro/steering/mateam.md)
   Kind: note | Source: .kiro/steering/mateam.md | Time: 2026-08-21T18:49:39.306Z
   Project path: c:\Users\Sitcd3\Documents\Rezerva DESIGN_Validator\Validator_Modul_X-test
   Step 1 — Decompose the Task
   Break the user's task into parallel workstreams. Standard roles:
   
   | Role | Responsibility |
   |---|---|
   | **Researcher** | Gathers context: reads relevant files, searches codebase, identifies dependencies |
   | **Coder** | Implements changes based on Researcher's findings |
   | **Reviewer** | Audits Coder's output for correctness, security, and style |
   | **Verifier** | Runs tests, checks build, confirms acceptance criteria are met |
   
   Assign only the roles the task requires. Small tasks may need only Researcher + Coder.

## Agent Handoff

- Before coding, read this file and the current active file.
- When a meaningful decision, correction, or conversation outcome happens, capture it through BrainSync.
- Do not assume hidden IDE chat history is available in the next tool; rely on this generated handoff.

