@echo off
REM Moves unused portfolio files to Desktop\Portfolio cleanup 2026-11-17 (nothing is deleted).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0cleanup-unused.ps1"
pause
