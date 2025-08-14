@echo off
title Emergency Stop - All Processes
color 0C

echo.
echo +===============================================================+
echo ^|                    EMERGENCY STOP                            ^|
echo +===============================================================+
echo.
echo [WARNING] This will stop ALL Python and Node.js processes!
echo [WARNING] This includes GUI Manager, servers, and any other scripts.
echo.
set /p confirm="Are you sure you want to continue? (y/n): "

if /I not "%confirm%"=="y" (
    echo [INFO] Operation cancelled.
    pause
    exit /b 0
)

echo.
echo [INFO] Stopping all Python processes...
taskkill /F /IM python.exe 2>nul
if errorlevel 1 (
    echo [INFO] No Python processes were running.
) else (
    echo [SUCCESS] Python processes stopped.
)

echo [INFO] Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if errorlevel 1 (
    echo [INFO] No Node.js processes were running.
) else (
    echo [SUCCESS] Node.js processes stopped.
)

echo.
echo [SUCCESS] All processes have been stopped.
echo [INFO] You can now restart the GUI Manager if needed.
echo.
pause
