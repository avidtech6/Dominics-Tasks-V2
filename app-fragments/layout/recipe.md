# M10 — Layout

## A. Product Description

App shell: top navigation + outlet for child route. Renders on every protected route.

- **Source:** `src/components/Layout.tsx`
- **Surface:** wraps all main routes

## B. Structural Contract

### Inputs
- Children (rendered in `<Outlet/>`)

### Outputs
- Top nav bar (logo, route links)
- Main content area (children)
- Footer (optional)

### Nav links
- Tasks | Calendar | Chat | Resources | History | Achievements | Parent Chat | Admin

## C. Reconstruction Notes

- Uses `useLocation` from react-router-dom to highlight active link.
- Mobile: hamburger menu (responsive).
