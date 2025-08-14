@echo off
title Quick Start - Bingo GUI Manager
color 0B

echo.
echo +===============================================================+
echo ^|              QUICK START - BINGO GUI MANAGER                  ^|
echo +===============================================================+
echo.

:: Check if server_manager_gui.py exists
if not exist "server_manager_gui.py" (
    echo [ERROR] server_manager_gui.py not found in current directory!
    echo Please make sure this batch file is in the project root folder.
    pause
    exit /b 1
)

echo [INFO] Starting Python GUI Server Manager...
echo [INFO] The GUI window will open shortly...
echo.

:: Start the GUI
python server_manager_gui.py

:: If we get here, the GUI was closed
echo.
echo [INFO] GUI Manager has been closed.
pause
