# M-error-boundary — Plan

## Atomic steps

1. Read recipe.md
2. Verify source files exist
3. Render via Playwright
4. Compare to recipe geometry

## Per-step

| Step | Capability | Expected output | Fallback |
|---|---|---|---|
| 1 | file read | recipe parsed | blocker.md |
| 2 | file stat | files exist | blocker.md |
| 3 | Playwright | rendered DOM | log error |
| 4 | visual diff | match | blocker.md |
