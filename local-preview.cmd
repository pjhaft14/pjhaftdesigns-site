@echo off
REM Serves this folder at http://localhost:8765 so you can view your local changes.
REM Nothing is uploaded. Close this window to stop the server.
cd /d "%~dp0"
echo Starting local preview at http://localhost:8765
echo Leave this window open while you browse. Close it to stop.
echo.
start "" http://localhost:8765/index.html
call npx --yes serve@14 -l 8765 .
pause
