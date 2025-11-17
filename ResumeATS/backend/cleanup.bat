@echo off
REM Cleanup script for Windows
echo ========================================
echo Resume ATS Analyzer - Cleanup Script
echo ========================================
echo.

python cleanup.py %*

if errorlevel 1 (
    echo.
    echo Error running cleanup script!
    pause
) else (
    echo.
    pause
)
