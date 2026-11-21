@echo off
setlocal
title Nong Trai Vui Ve
where python >nul 2>&1
if errorlevel 1 (
    start "" "%~dp0index.html"
    exit /b 0
)
python "%~dp0serve_game.py" --lan --open
if errorlevel 1 pause
