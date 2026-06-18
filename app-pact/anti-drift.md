# Anti-Drift Rules (this app's instance) — DominicsTasks

Reference: FWV v8 doctrine/08-anti-drift.md (the 7 universal rules)

## App-specific application of the 7 rules

### Rule 1 — Single source of truth for each behaviour
- **Source:** behaviour classes in `src/behaviours/*.ts`
- **Anti-drift check:** no component should mutate behaviour state outside method calls
- **Verification:** grep for direct property writes to behaviour instances

### Rule 2 — Safe Diff Protocol
- **Source:** Phase 3 procedure
- **Anti-drift check:** every file change is extracted → echoed → micro-diffed → verified → committed
- **Verification:** drift log entries

### Rule 3 — Echo before action
- **Source:** doctrine/06 §3.3
- **Anti-drift check:** before moving/extracting any file, print its structure
- **Verification:** drift log

### Rule 4 — Binary verification
- **Source:** doctrine/06 §3.3
- **Anti-drift check:** every fragment has at least one validity test
- **Verification:** `app-vp/validity/` must contain tests for every behaviour

### Rule 5 — No invented structure
- **Source:** doctrine/06 §6
- **Anti-drift check:** every module in `app-fragments/` maps to an existing source file
- **Verification:** see `app-trace-atlas/atlas.json`

### Rule 6 — Behaviour/state verification
- **Source:** doctrine/08
- **Anti-drift check:** all event handlers, lifecycle hooks, state transitions documented in codex.md C1
- **Verification:** every behaviour.md in shadow/extraction/behaviours/ has source-line evidence

### Rule 7 — Drift detection on rebuild
- **Source:** doctrine/06 §8
- **Anti-drift check:** after rebuild, run cascaded click-test, verify equivalence
- **Verification:** cascaded click-test passes against deployed URL

## What this app does NOT use (and why)

- **DNA tags / audit tagging** — FWV v8 doctrine mentions these for platform-level work; not needed for app refactor
- **Pact fragment_ids** — this is an app, not a platform
- **Full Recipe rebuild byte-equivalence** — this app is React+Vite; the Recipe rebuilds the SOURCE, not the BUNDLE. Bundle is a downstream concern.
