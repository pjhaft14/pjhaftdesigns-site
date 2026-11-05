@echo off
REM Builds dist/ and uploads it to Cloudflare Pages (www.pjhaftdesigns.com).
cd /d "%~dp0"
echo Building site...
call npm run build
if errorlevel 1 goto fail
echo Uploading to Cloudflare Pages...
call npx wrangler pages deploy dist --project-name pjhaftdesigns-site --branch main
if errorlevel 1 goto fail
echo.
echo Done - changes are live.
pause
exit /b 0
:fail
echo.
echo PUBLISH FAILED - copy the error above and send it to Claude.
pause
