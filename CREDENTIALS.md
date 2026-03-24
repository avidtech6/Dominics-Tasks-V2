# Dominic's Tasks - Complete Credentials & Configuration

⚠️ **IMPORTANT**: Always use credentials from `/workspace/dominicstasks/deploy-pages.cjs` - these are guaranteed to be correct!

**Project:** Dominics Tasks  
**Project ID:** dominics-tasks  
**App URL:** https://dominicstasks.pages.dev  
**Last Updated:** January 19, 2026

---

## Firebase Configuration

**Firebase Console:** https://console.firebase.google.com/project/dominics-tasks

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDqaJdLrUythnSYRK_kEiY7lduLCK2a9AI",
  authDomain: "dominics-tasks.firebaseapp.com",
  projectId: "dominics-tasks",
  storageBucket: "dominics-tasks.firebasestorage.app",
  messagingSenderId: "493020454735",
  appId: "1:493020454735:web:bc86b67dff201542cc2f3a"
};
```

### Authorized Emails (Access Control)
- `dominicgiles691@gmail.com` (Dominic - Student)
- `derrickmg.admin@gmail.com` (Parent 1)
- `brendamgiles@gmail.com` (Parent 2)

### Parent-Only Emails (Admin Access)
- `derrickmg.admin@gmail.com`
- `brendamgiles@gmail.com`

### Firestore Collections
- `users/` - Legacy user data (read-only)
- `families/{familyId}` - Multi-child family data
  - Sub-collections: `children/{childId}`, `children/{childId}/tasks`, `approvals`

### Firestore Rules Location
`/workspace/dominicstasks/firestore.rules`

---

## Cloudflare Pages (CORRECT CREDENTIALS)

**Dashboard:** https://dash.cloudflare.com/13943b867887b7e4d4df7f05cfae9100/pages/project/dominicstasks

**Account ID:** `13943b867887b7e4d4df7f05cfae9100`

**API Token:** `snyg2OlbyiNstesI41E7zXyI2jlnhbCDSdny3gAy` ✓ (CORRECT - from deploy-pages.cjs)

**NOTE:** These are the CORRECT credentials from deploy-pages.cjs. Always use these!

**NOTE:** Token has limited permissions. Best to deploy via Cloudflare Dashboard or generate a new token with "Pages:Edit" permission.

### Deploy Commands

**Option 1: Using the deployment script (Recommended)**
```bash
cd /workspace/dominicstasks
node deploy-pages.cjs
```

**Option 2: Using Wrangler**
```bash
export CLOUDFLARE_API_TOKEN="snyg2OlbyiNstesI41E7zXyI2jlnhbCDSdny3gAy"
npx wrangler pages deploy ./dist --project-name=dominicstasks
```

**Option 3: Cloudflare Dashboard**
1. Go to https://dash.cloudflare.com → Pages → dominicstasks
2. Click "Deployments" → "Upload assets"
3. Upload contents of `/workspace/dominicstasks/dist/`

### Current Deployment Status
- **Production URL:** https://dominicstasks.pages.dev
- **Latest Preview:** https://0fa57aa8.dominicstasks.pages.dev (needs promotion to production)

---

## Deployment Checklist

Before deploying a new version:

- [ ] Build the project: `npm run build`
- [ ] Verify build output in `/workspace/dominicstasks/dist/`
- [ ] Run tests (if any): `npm test`
- [ ] Deploy using `node deploy-pages.cjs`
- [ ] Verify deployment at dominicstasks.pages.dev
- [ ] Test login flow
- [ ] Test key features

---

## Known Issues & Workarounds

1. **API Token Permissions:** The Cloudflare API token may not have sufficient permissions for programmatic deployment. Use Cloudflare Dashboard as a workaround.

2. **Firebase Authorized Domains:** New domains must be added manually in Firebase Console:
   - Go to: Firebase Console → Authentication → Sign-in method → Google
   - Add domain to "Authorized domains" list

---

## Project Structure

```
/workspace/dominicstasks/
├── src/
│   ├── components/     # React components
│   ├── context/        # React contexts (Auth, Family, Tasks)
│   ├── pages/          # Page components
│   ├── services/       # Firebase & other services
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── dist/               # Built production files (deploy this)
├── firestore.rules     # Firestore security rules
├── deploy-pages.cjs    # Cloudflare Pages deployment script
└── package.json        # Dependencies & scripts
```

---

## Quick Reference

| Service | Value |
|---------|-------|
| Firebase Project | dominics-tasks |
| Firebase API Key | AIzaSyDqaJdLrUythnSYRK_kEiY7lduLCK2a9AI |
| Cloudflare Account | 13943b867887b7e4d4df7f05cfae9100 |
| Cloudflare API Token | snyg2OlbyiNstesI41E7zXyI2jlnhbCDSdny3gAy ✓ |
| Cloudflare Project | dominicstasks |
| Production URL | https://dominicstasks.pages.dev |

---

## Last Modified By
MiniMax Agent - January 19, 2026
