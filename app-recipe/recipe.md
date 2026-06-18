# App-Recipe — DominicsTasks

**App ID:** avidtech6.dominicstasks.6be9
**Version:** 0.1.0
**FWV version:** v8
**Date:** 2026-06-18
**Refactorer:** Mavis (mavis)

This is the portable Recipe. Given this Recipe + the FWV v8 doctrine + the
project's source code, a fresh implementer can rebuild any module.

## What's in the Recipe

```
app-recipe/
├── recipe.md                  ← you are here (the manifest)
├── metadata.json              ← machine-readable Recipe metadata
├── snapshot/
│   └── drift-log.md           ← phase-by-phase refactor decisions
└── shadow/
    └── original-001/          ← source code snapshot before refactor

app-codex/
└── app-codex.md               ← UI + behaviour structure index

app-pact/
├── app-pact.md                ← invariants, constraints, guarantees, rules
├── invariants.md              ← invariants list (cross-ref)
└── anti-drift.md              ← 7 universal anti-drift rules applied

app-dna/
└── app.dna.json               ← app identity, lineage, version

app-fragments/
└── <14 modules>/
    ├── recipe.md              ← module product description
    ├── codex.md               ← module behaviour (C1-C8)
    ├── rules.md               ← 9 universal workflow things
    ├── module-meta.json       ← module identity
    ├── ingredients.json       ← dependencies, data shapes, env
    ├── plan.md                ← atomic steps
    ├── coverage-matrix.md     ← source → recipe → implementation → test
    ├── trace-atlas/           ← lineage, forks, shadows
    ├── dna/                   ← DNA artefacts
    └── diffs/                 ← version diffs

app-trace-atlas/
└── atlas.json                 ← UI → behaviour → module → file → test graph

app-vp/
├── validity/                  ← behaviour-level tests (13/13 PASS)
├── protection/                ← Recipe integrity tests (7/7 PASS)
├── run-validity.ts            ← tsx-runnable validity suite
└── run-protection.ts          ← tsx-runnable protection suite
```

## Modules (14 total)

| ID | Name | Recipe path | C7 test status |
|---|---|---|---|
| M00 | orchestrator | `app-fragments/orchestrator/` | PASS (auto) |
| M00b | data-layer | `app-fragments/data-layer/` | PASS (auto) |
| M01 | tasks | `app-fragments/tasks/` | PASS (validity) |
| M02 | family-chat | `app-fragments/family-chat/` | PASS (validity) |
| M03 | family-setup | `app-fragments/family-setup/` | PASS (validity) |
| M04 | auth | `app-fragments/auth/` | PASS (validity) |
| M05 | calendar | `app-fragments/calendar/` | PASS (auto) |
| M06 | resources | `app-fragments/resources/` | PASS (auto) |
| M07 | history | `app-fragments/history/` | PASS (auto) |
| M08 | achievements | `app-fragments/achievements/` | PASS (auto) |
| M09 | parent-dashboard | `app-fragments/parent-dashboard/` | PASS (auto) |
| M10 | layout | `app-fragments/layout/` | PASS (auto) |
| M11 | comments | `app-fragments/comments/` | PASS (auto) |
| M12 | error-boundary | `app-fragments/error-boundary/` | PASS (auto) |

## How to rebuild

1. Read `doctrine/00-philosophy.md` through `doctrine/22-behaviour-first-codex.md`.
2. Read `app-recipe/recipe.md` (this file).
3. Read `app-pact/app-pact.md` for invariants.
4. For each module you want to rebuild:
   - Read `app-fragments/<name>/recipe.md`
   - Read `app-fragments/<name>/codex.md`
   - Follow `app-fragments/<name>/plan.md`
   - Verify against `app-fragments/<name>/coverage-matrix.md`
5. Run `npx tsx --test app-vp/run-validity.ts` to verify behaviour.
6. Run `npx tsx --test app-vp/run-protection.ts` to verify Recipe integrity.

## Verification status

- Validity tests: **13/13 PASS**
- Protection tests: **7/7 PASS**
- Combined: **20/20 PASS**
- Build: `npm run build` succeeds (verified earlier in this session)
- Deploy: `https://ahago45ksit8.space.minimax.io` (live)
