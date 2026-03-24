@echo off
REM Dominic's Tasks Deployment Script for Windows
REM This script handles building and deploying the application to Cloudflare Pages

setlocal enabledelayedexpansion

echo === Dominic's Tasks Deployment Script ===

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Run this script from the project root.
    exit /b 1
)

REM Parse command line arguments
set ENVIRONMENT=production
set DRY_RUN=false
set FORCE=false

:parse_args
if "%1"=="" goto :args_done
if "%1"=="--staging" (
    set ENVIRONMENT=staging
    shift
    goto :parse_args
)
if "%1"=="--dry-run" (
    set DRY_RUN=true
    shift
    goto :parse_args
)
if "%1"=="--force" (
    set FORCE=true
    shift
    goto :parse_args
)
if "%1"=="--help" (
    echo Usage: deploy.bat [OPTIONS]
    echo.
    echo Options:
    echo   --staging     Deploy to staging environment
    echo   --dry-run     Perform build and checks without deploying
    echo   --force       Skip confirmation prompts
    echo   --help        Show this help message
    exit /b 0
)
echo Unknown option: %1
exit /b 1
:args_done

echo Environment: %ENVIRONMENT%
echo Dry run: %DRY_RUN%

REM Check for required tools
echo.
echo Checking required tools...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install it first.
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install it first.
    exit /b 1
)

where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: wrangler is not installed. Please install it first (npm install -g wrangler).
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1 delims=." %%i in ('node --version') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:~1%
for /f "tokens=1 delims=." %%i in ("%NODE_VERSION%") do set NODE_MAJOR=%%i

if %NODE_MAJOR% lss 18 (
    echo Error: Node.js version 18 or higher is required. Found version %NODE_VERSION%.
    exit /b 1
)
echo ✓ Node.js %NODE_VERSION%

REM Check if environment variables are set for production
if "%ENVIRONMENT%"=="production" (
    if "%DRY_RUN%"=="false" (
        echo.
        echo Checking environment variables...
        
        if "%VITE_FIREBASE_API_KEY%"=="" (
            echo Warning: VITE_FIREBASE_API_KEY is not set
            echo You can set it in .env.production or as an environment variable
            
            if "%FORCE%"=="false" (
                set /p CONTINUE="Continue anyway? (y/n): "
                if /i not "!CONTINUE!"=="y" (
                    echo Aborting deployment.
                    exit /b 1
                )
            )
        ) else (
            echo ✓ Firebase environment variables are set
        )
    )
)

REM Install dependencies
echo.
echo Installing dependencies...
call npm ci --silent
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)
echo ✓ Dependencies installed

REM Run tests
echo.
echo Running tests...
call npm test -- --pass-with-no-tests
if %errorlevel% neq 0 (
    echo ✗ Tests failed
    
    if "%FORCE%"=="false" (
        set /p CONTINUE="Continue with deployment anyway? (y/n): "
        if /i not "!CONTINUE!"=="y" (
            echo Aborting deployment.
            exit /b 1
        )
    )
) else (
    echo ✓ Tests passed
)

REM Build the application
echo.
echo Building application...
if "%ENVIRONMENT%"=="production" (
    call npm run build
) else (
    REM For staging, we might want different build options
    set VITE_DEV_MODE=true
    call npm run build
)

if %errorlevel% neq 0 (
    echo Error: Build failed
    exit /b 1
)

REM Verify build output
echo.
echo Verifying build output...
if exist "dist\index.html" (
    if exist "dist\assets\" (
        echo ✓ Build output verified
        for %%F in (dist\index.html) do set FILESIZE=%%~zF
        echo   - dist\index.html: !FILESIZE! bytes
        
        dir /b /a-d "dist\assets\" | find /c /v "" >nul
        set /p FILE_COUNT=<nul
        for /f %%C in ('dir /b /a-d "dist\assets\" ^| find /c /v ""') do set FILE_COUNT=%%C
        echo   - dist\assets: !FILE_COUNT! files
    ) else (
        echo ✗ Build output verification failed: dist\assets directory not found
        dir dist\
        exit /b 1
    )
) else (
    echo ✗ Build output verification failed: dist\index.html not found
    dir dist\
    exit /b 1
)

REM Deploy to Cloudflare Pages
if "%DRY_RUN%"=="false" (
    echo.
    echo Deploying to Cloudflare Pages (%ENVIRONMENT%)...
    
    if "%FORCE%"=="false" (
        echo About to deploy to %ENVIRONMENT% environment.
        set /p CONTINUE="Continue with deployment? (y/n): "
        if /i not "!CONTINUE!"=="y" (
            echo Deployment cancelled.
            exit /b 0
        )
    )
    
    REM Deploy using wrangler
    if "%ENVIRONMENT%"=="staging" (
        echo Deploying to staging...
        call wrangler pages deploy dist --project-name=dominicstasks --branch=develop
    ) else (
        echo Deploying to production...
        call wrangler pages deploy dist --project-name=dominicstasks
    )
    
    if %errorlevel% equ 0 (
        echo.
        echo ✓ Deployment successful!
        echo The application should be live in a few minutes.
    ) else (
        echo.
        echo ✗ Deployment failed
        exit /b 1
    )
) else (
    echo.
    echo ✓ Dry run completed successfully
    echo The application is ready for deployment.
    echo To deploy, run: deploy.bat
)

echo.
echo === Deployment script completed ===
endlocal