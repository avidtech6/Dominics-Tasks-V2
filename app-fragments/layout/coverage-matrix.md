# M10 — Layout — Coverage Matrix

Verified against the post-alignment build (2026-06-29).

| Source feature | Source-line evidence | Recipe/codex claim | Implementation status | Test status |
|---|---|---|---|---|
| Top nav with route links | `src/components/Layout.tsx:60-78` | recipe §B Outputs: "nav links" | ✅ implemented | cascaded click-test: all routes load under Layout ✅ |
| Active link highlighting | `NavLink isActive` from `react-router-dom` | codex §C: "Uses useLocation … highlight active link" (recipe + codex §C) | ✅ implemented | manual |
| Mobile hamburger menu | `src/components/Layout.tsx:90-128` | recipe §C: "Mobile: hamburger menu" | ✅ implemented | viewport-dependent (manual) |
| Sign-out button calls `authBehaviour.signOut()` | `src/components/Layout.tsx:34-44` | recipe §B implicit; codex M04 §C1: signOut handler | ✅ implemented (after alignment) | manual |
| Outlet for child route | `<main>{children}</main>` | recipe §A: outlet for child route | ✅ implemented | every route uses children |

## Removed / not present (per recipe scope)

- Topbar sidebar (was invented — not in recipe; replaced with top nav + hamburger)
- familyBehaviour.* facade calls (were invented — not in actual FamilyBehaviour API; removed)
- (user as any).uid / .photoURL / .experience casts (TypeScript unknown leaks; removed)
- Auth-state / parent-mode toggle / profile carousel (were invented; not in recipe §A "Top nav + outlet")
- Footer (recipe: optional, omitted)

## Notes

The pre-alignment Layout was 400 lines and called 15+ methods that didn't exist on the actual behaviours. After alignment it's ~150 lines and matches the recipe exactly. The cuts are reviewed in `app-recipe/audits/2026-06-29-recipe-vs-code-drift.md`.
