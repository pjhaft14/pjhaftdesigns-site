@echo off
REM Builds dist/ and uploads it to a Cloudflare Pages PREVIEW branch.
REM Your live site (www.pjhaftdesigns.com) is NOT changed.
cd /d "%~dp0"
echo Building site...
call npm run build
if errorlevel 1 goto fail
echo Uploading preview to Cloudflare Pages...
call npx wrangler pages deploy dist --project-name pjhaftdesigns-site --branch preview
if errorlevel 1 goto fail
echo.
echo Done - preview is ready at:
echo   https://preview.pjhaftdesigns-site.pages.dev
echo Your live site has not changed.
pause
exit /b 0
:fail
echo.
echo PREVIEW FAILED - copy the error above and send it to Claude.
pause
