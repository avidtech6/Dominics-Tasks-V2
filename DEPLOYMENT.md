# Deployment Guide

This document outlines the deployment process for Dominic's Tasks application to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account** with Pages access
2. **Firebase Project** configured with:
   - Authentication (Google Sign-In enabled)
   - Firestore Database
   - Storage Bucket
3. **GitHub Repository** with the application code

## Environment Variables

The following environment variables must be set in both local development and production:

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Development Mode
```
VITE_DEV_MODE=true  # Set to empty string or false for production
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file with Firebase credentials:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. The build output will be in the `dist/` directory.

## Cloudflare Pages Deployment

### Manual Deployment

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Deploy to Cloudflare Pages:
   ```bash
   wrangler pages deploy dist --project-name=dominicstasks
   ```

### Automated Deployment via GitHub Actions

The repository includes a CI/CD pipeline that automatically deploys:

1. **On Pull Requests**: Deploys a preview environment
2. **On Push to Main**: Deploys to production

#### Required GitHub Secrets

Set the following secrets in your GitHub repository settings:

| Secret Name | Description |
|-------------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages write access |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |

## Firebase Configuration

### Firestore Security Rules

1. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Rules are defined in `firestore.rules`

### Storage Security Rules

1. Deploy Storage rules:
   ```bash
   firebase deploy --only storage:rules
   ```

2. Rules are defined in `storage.rules`

## Testing in Production

After deployment, verify:

1. **Application loads** without JavaScript errors
2. **Authentication works** (Google Sign-In)
3. **Firestore reads/writes** function correctly
4. **File uploads** to Storage work
5. **Real-time updates** work across devices

## Monitoring and Logging

### Cloudflare Analytics
- Visit Cloudflare Dashboard > Pages > dominicstasks
- View deployment history, analytics, and logs

### Firebase Console
- Monitor Firestore usage and storage
- Check authentication logs
- Review error reports in Crashlytics

## Rollback Procedure

If a deployment causes issues:

1. In Cloudflare Pages dashboard, select the previous working deployment
2. Click "Promote to production"
3. The previous version will be restored immediately

## Troubleshooting

### Common Issues

1. **Authentication fails in production**
   - Verify Firebase auth domain includes your Cloudflare Pages domain
   - Check OAuth redirect URIs in Firebase Console

2. **CORS errors with Firebase**
   - Ensure Cloudflare headers allow cross-origin requests
   - Check `public/_headers` file for proper CSP configuration

3. **Build fails in CI/CD**
   - Check environment variables are properly set as GitHub secrets
   - Verify Node.js version compatibility

4. **Real-time updates not working**
   - Check Firestore security rules allow read/write
   - Verify Firebase project is on Blaze plan (required for real-time)

### Debugging Production

1. Enable browser developer tools
2. Check console for errors
3. Use Network tab to inspect API requests
4. Verify Firebase SDK initialization

## Performance Optimization

1. **Image Optimization**: Use appropriate image formats and sizes
2. **Code Splitting**: Vite automatically handles this
3. **Caching**: Cloudflare Pages provides automatic edge caching
4. **Bundle Analysis**: Run `npm run build` and check bundle size

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to repository
2. **API Keys**: Use environment variables for all sensitive data
3. **CSP Headers**: Configured in `public/_headers` for production
4. **Firebase Rules**: Regularly review and update security rules
5. **Dependency Updates**: Regularly update npm dependencies for security patches

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review Firebase usage and costs
- Monitor Cloudflare analytics
- Test deployment pipeline

### Backup Strategy
- Firestore data: Use Firebase export/import
- Storage files: Manual backup via Firebase Console
- Application code: GitHub repository

## Support

For deployment issues:
1. Check Cloudflare Pages documentation
2. Review Firebase Console for errors
3. Examine GitHub Actions logs
4. Contact development team