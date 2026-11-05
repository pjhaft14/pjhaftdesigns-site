@echo off
REM Builds dist/ and uploads it to Cloudflare Pages (www.pjhaftdesigns.com).
cd /d "%~dp0"
echo Building and deploying pjhaftdesigns.com...
call npm run deploy
echo.
if errorlevel 1 (echo DEPLOY FAILED - copy the error above and send it to Claude.) else (echo Done - changes are live.)
pause
