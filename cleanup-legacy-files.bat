@echo off
REM Cleanup script for legacy and test files
REM Moves files to a backup directory instead of deleting them

set BACKUP_DIR=legacy-backup-%DATE:~-4%-%DATE:~4,2%-%DATE:~7,2%

echo Creating backup directory: %BACKUP_DIR%
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Moving test files...
move test-*.mjs "%BACKUP_DIR%\" >nul 2>&1
move test-*.js "%BACKUP_DIR%\" >nul 2>&1
move test-*.cjs "%BACKUP_DIR%\" >nul 2>&1
move *.test.* "%BACKUP_DIR%\" >nul 2>&1
move *.spec.* "%BACKUP_DIR%\" >nul 2>&1

echo Moving diagnostic files...
move check-*.mjs "%BACKUP_DIR%\" >nul 2>&1
move check-*.js "%BACKUP_DIR%\" >nul 2>&1
move debug-*.js "%BACKUP_DIR%\" >nul 2>&1
move js-debug.js "%BACKUP_DIR%\" >nul 2>&1
move simple-test.js "%BACKUP_DIR%\" >nul 2>&1
move fresh-test.js "%BACKUP_DIR%\" >nul 2>&1
move click-test.js "%BACKUP_DIR%\" >nul 2>&1

echo Moving old screenshots...
move screenshot*.png "%BACKUP_DIR%\" >nul 2>&1
move screenshot*.jpg "%BACKUP_DIR%\" >nul 2>&1

echo Moving old HTML files...
move tasks.html "%BACKUP_DIR%\" >nul 2>&1
move admin-dashboard.html "%BACKUP_DIR%\" >nul 2>&1

echo Moving old deployment scripts...
move deploy-*.cjs "%BACKUP_DIR%\" >nul 2>&1
move upload-pages.cjs "%BACKUP_DIR%\" >nul 2>&1

echo Moving old zip files...
move *.zip "%BACKUP_DIR%\" >nul 2>&1

echo Moving old text files...
move LEGACY_*.txt "%BACKUP_DIR%\" >nul 2>&1
move LEGACY_*.md "%BACKUP_DIR%\" >nul 2>&1
move deploy_url.txt "%BACKUP_DIR%\" >nul 2>&1

echo Moving visual test files...
move visual-test.mjs "%BACKUP_DIR%\" >nul 2>&1
move verify-login.mjs "%BACKUP_DIR%\" >nul 2>&1

echo Cleanup complete! Files moved to %BACKUP_DIR%
echo.
echo Note: The following legacy files were NOT moved as they may still be needed:
echo   - src/main.legacy.tsx
echo   - src/App.legacy.tsx  
echo   - src/context/AuthContext.legacy.tsx
echo   - src/services/migrateV1ToV2.ts
echo   - vite.config.legacy.ts
echo   - dist-legacy/ directory
echo   - firestore.rules (security rules)
echo   - storage.rules (new security rules)
echo   - .env.* files
echo   - package.json, package-lock.json
echo   - tsconfig.*.json
echo   - tailwind.config.js, postcss.config.js
echo   - wrangler.toml
echo   - README.md, *.md documentation files
echo.
echo To restore files, copy them back from %BACKUP_DIR%
pause