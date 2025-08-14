@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title Bingo Server GUI Manager
color 0A

:: Set the project directory (adjust if needed)
set PROJECT_DIR=%~dp0

:: Check if we're in the correct directory
if not exist "%PROJECT_DIR%server_manager_gui.py" (
    echo.
    echo [ERROR] server_manager_gui.py not found in current directory!
    echo Make sure this batch file is in the same folder as server_manager_gui.py
    echo Current directory: %PROJECT_DIR%
    pause
    exit /b 1
)

:MAIN_MENU
cls
echo.
echo  +===============================================================+
echo  ^|                    BINGO SERVER GUI MANAGER                   ^|
echo  ^|                         Phase 6B Ready                       ^|
echo  +===============================================================+
echo.
echo  Current Directory: %PROJECT_DIR%
echo.
echo  [1] Start GUI Server Manager
echo  [2] Stop All Python Processes (Emergency Stop)
echo  [3] Check GUI Process Status
echo  [4] Open Project Folder
echo  [5] View Recent Logs
echo  [6] Exit
echo.
set /p choice="Select an option (1-6): "

if "%choice%"=="1" goto START_GUI
if "%choice%"=="2" goto STOP_PYTHON
if "%choice%"=="3" goto CHECK_STATUS
if "%choice%"=="4" goto OPEN_FOLDER
if "%choice%"=="5" goto VIEW_LOGS
if "%choice%"=="6" goto EXIT
goto INVALID_CHOICE

:START_GUI
cls
echo.
echo +===============================================================+
echo ^|                    STARTING GUI MANAGER                       ^|
echo +===============================================================+
echo.
echo [INFO] Checking Python installation...

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python and make sure it's added to your PATH.
    pause
    goto MAIN_MENU
)

echo [INFO] Python found: 
python --version

echo [INFO] Checking for existing GUI processes...
tasklist /FI "IMAGENAME eq python.exe" /FI "WINDOWTITLE eq *server_manager_gui*" 2>nul | find /I "python.exe" >nul
if not errorlevel 1 (
    echo [WARNING] GUI Manager might already be running!
    echo [INFO] If you're having issues, try option 2 to stop all Python processes first.
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /I not "!continue!"=="y" goto MAIN_MENU
)

echo [INFO] Starting Python GUI Server Manager...
echo [INFO] This will open the GUI window. You can close this console or minimize it.
echo.

:: Start the GUI in a new window so this batch file doesn't block
start "Bingo GUI Manager" python "%PROJECT_DIR%server_manager_gui.py"

:: Wait a moment and check if it started successfully
timeout /t 3 /nobreak >nul
tasklist /FI "IMAGENAME eq python.exe" 2>nul | find /I "python.exe" >nul
if not errorlevel 1 (
    echo [SUCCESS] GUI Manager started successfully!
    echo [INFO] The GUI window should now be open.
) else (
    echo [WARNING] Could not confirm if GUI started successfully.
    echo [INFO] Check for any error messages in the GUI window.
)

echo.
echo Press any key to return to menu...
pause >nul
goto MAIN_MENU

:STOP_PYTHON
cls
echo.
echo +===============================================================+
echo ^|                    EMERGENCY STOP - PYTHON                   ^|
echo +===============================================================+
echo.
echo [WARNING] This will forcefully stop ALL Python processes!
echo [WARNING] This includes the GUI Manager and any running servers.
echo.
set /p confirm="Are you sure? This will stop ALL Python processes (y/n): "
if /I not "%confirm%"=="y" goto MAIN_MENU

echo.
echo [INFO] Stopping all Python processes...
taskkill /F /IM python.exe 2>nul
if errorlevel 1 (
    echo [INFO] No Python processes were running.
) else (
    echo [SUCCESS] All Python processes have been stopped.
)

echo [INFO] Stopping any Node.js processes (npm run dev)...
taskkill /F /IM node.exe 2>nul
if not errorlevel 1 (
    echo [SUCCESS] Node.js processes stopped.
)

echo.
echo [INFO] All processes stopped. You can now restart the GUI Manager.
echo.
echo Press any key to return to menu...
pause >nul
goto MAIN_MENU

:CHECK_STATUS
cls
echo.
echo +===============================================================+
echo ^|                      PROCESS STATUS                          ^|
echo +===============================================================+
echo.

echo [INFO] Checking for Python processes...
tasklist /FI "IMAGENAME eq python.exe" 2>nul | find /I "python.exe" >nul
if not errorlevel 1 (
    echo [FOUND] Python processes running:
    tasklist /FI "IMAGENAME eq python.exe" | findstr /I python.exe
) else (
    echo [INFO] No Python processes found.
)

echo.
echo [INFO] Checking for Node.js processes...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if not errorlevel 1 (
    echo [FOUND] Node.js processes running:
    tasklist /FI "IMAGENAME eq node.exe" | findstr /I node.exe
) else (
    echo [INFO] No Node.js processes found.
)

echo.
echo [INFO] Checking if server is responding on port 5000...
netstat -an | find "5000" >nul
if not errorlevel 1 (
    echo [FOUND] Something is listening on port 5000:
    netstat -an | find "5000"
) else (
    echo [INFO] Port 5000 is not in use.
)

echo.
echo Press any key to return to menu...
pause >nul
goto MAIN_MENU

:OPEN_FOLDER
cls
echo.
echo +===============================================================+
echo ^|                    OPENING PROJECT FOLDER                    ^|
echo +===============================================================+
echo.
echo [INFO] Opening project folder in Windows Explorer...
explorer "%PROJECT_DIR%"
echo [SUCCESS] Project folder opened.
echo.
echo Press any key to return to menu...
pause >nul
goto MAIN_MENU

:VIEW_LOGS
cls
echo.
echo +===============================================================+
echo ^|                       RECENT LOGS                            ^|
echo +===============================================================+
echo.

if exist "%PROJECT_DIR%debugging" (
    echo [INFO] Recent log files in debugging folder:
    echo.
    dir /B /O:D "%PROJECT_DIR%debugging\*.log" 2>nul | findstr /R ".*" >nul
    if not errorlevel 1 (
        for /f %%f in ('dir /B /O:-D "%PROJECT_DIR%debugging\*.log" 2^>nul') do (
            echo   • %%f
        )
        echo.
        echo [INFO] You can view these logs using the GUI Manager's log viewer.
    ) else (
        echo [INFO] No log files found in debugging folder.
    )
) else (
    echo [INFO] Debugging folder not found. Logs will be created when server runs.
)

echo.
echo [INFO] Opening debugging folder...
if exist "%PROJECT_DIR%debugging" (
    explorer "%PROJECT_DIR%debugging"
) else (
    echo [INFO] Debugging folder doesn't exist yet.
)

echo.
echo Press any key to return to menu...
pause >nul
goto MAIN_MENU

:INVALID_CHOICE
cls
echo.
echo [ERROR] Invalid choice! Please select a number between 1-6.
echo.
timeout /t 2 /nobreak >nul
goto MAIN_MENU

:EXIT
cls
echo.
echo +===============================================================+
echo ^|                         GOODBYE!                             ^|
echo +===============================================================+
echo.
echo [INFO] Exiting Bingo Server GUI Manager...
echo [INFO] The GUI Manager (if running) will continue in the background.
echo [INFO] Use option 2 to stop all processes if needed.
echo.
timeout /t 2 /nobreak >nul
exit /b 0
