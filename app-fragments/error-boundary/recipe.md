# M12 — Error Boundary

## A. Product Description

React error boundary that catches render-time errors anywhere in the tree and shows a fallback UI.

- **Source:** `src/components/ErrorBoundary.tsx`
- **Surface:** wraps the entire app (or large subtrees)

## B. Structural Contract

### Lifecycle
- `componentDidCatch(error, errorInfo)` — logs error
- `getDerivedStateFromError(error)` — sets hasError=true
- Render: fallback UI when hasError

### Inputs
- Children (anything that might throw during render)

### Outputs
- Either children or fallback UI

## C. Reconstruction Notes

- This is standard React error boundary pattern.
- No custom fallback content; uses default React error UI.
