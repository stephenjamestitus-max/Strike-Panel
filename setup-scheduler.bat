@echo off
REM ============================================================
REM  StrikePanel — Windows Task Scheduler Setup
REM  Run this once as Administrator to register all 4 tasks.
REM
REM  All times are Dubai (UTC+4). Windows Task Scheduler
REM  uses LOCAL time, so adjust if your PC is not set to
REM  Dubai/GST (UTC+4).
REM
REM  Schedule:
REM    08:00 — Daily Post    (run-daily.js)
REM    08:10 — Daily Story   (run-story.js)
REM    17:00 — Engage        (run-engage.js)
REM    17:15 — Follow        (run-follow.js)
REM ============================================================

SET WORKDIR=C:\Users\steph\Strike-Panel
SET LOGDIR=C:\Users\steph\Strike-Panel\logs
SET NODE=node

echo.
echo === StrikePanel Task Scheduler Setup ===
echo Working directory: %WORKDIR%
echo Logs directory:    %LOGDIR%
echo.

REM Create logs directory
if not exist "%LOGDIR%" (
    mkdir "%LOGDIR%"
    echo Created logs directory: %LOGDIR%
) else (
    echo Logs directory already exists: %LOGDIR%
)
echo.

REM -------------------------------------------------------
REM Task 1: Daily Post — 08:00 Dubai daily
REM -------------------------------------------------------
echo Registering Task 1: StrikePanel-Daily-Post (08:00)...
schtasks /create ^
  /tn "StrikePanel-Daily-Post" ^
  /tr "cmd /c cd /d \"%WORKDIR%\" && %NODE% scripts/marketing/run-daily.js >> \"%LOGDIR%\run-daily.log\" 2>&1" ^
  /sc DAILY ^
  /st 08:00 ^
  /rl HIGHEST ^
  /ru SYSTEM ^
  /f
if %ERRORLEVEL% EQU 0 (
    echo   [OK] StrikePanel-Daily-Post registered
) else (
    echo   [WARN] StrikePanel-Daily-Post may already exist or failed — check permissions
)
echo.

REM -------------------------------------------------------
REM Task 2: Daily Story — 08:10 Dubai daily
REM -------------------------------------------------------
echo Registering Task 2: StrikePanel-Daily-Story (08:10)...
schtasks /create ^
  /tn "StrikePanel-Daily-Story" ^
  /tr "cmd /c cd /d \"%WORKDIR%\" && %NODE% scripts/marketing/run-story.js >> \"%LOGDIR%\run-story.log\" 2>&1" ^
  /sc DAILY ^
  /st 08:10 ^
  /rl HIGHEST ^
  /ru SYSTEM ^
  /f
if %ERRORLEVEL% EQU 0 (
    echo   [OK] StrikePanel-Daily-Story registered
) else (
    echo   [WARN] StrikePanel-Daily-Story may already exist or failed — check permissions
)
echo.

REM -------------------------------------------------------
REM Task 3: Engage (comments) — 17:00 Dubai daily
REM -------------------------------------------------------
echo Registering Task 3: StrikePanel-Engage (17:00)...
schtasks /create ^
  /tn "StrikePanel-Engage" ^
  /tr "cmd /c cd /d \"%WORKDIR%\" && %NODE% scripts/marketing/run-engage.js >> \"%LOGDIR%\run-engage.log\" 2>&1" ^
  /sc DAILY ^
  /st 17:00 ^
  /rl HIGHEST ^
  /ru SYSTEM ^
  /f
if %ERRORLEVEL% EQU 0 (
    echo   [OK] StrikePanel-Engage registered
) else (
    echo   [WARN] StrikePanel-Engage may already exist or failed — check permissions
)
echo.

REM -------------------------------------------------------
REM Task 4: Follow — 17:15 Dubai daily
REM -------------------------------------------------------
echo Registering Task 4: StrikePanel-Follow (17:15)...
schtasks /create ^
  /tn "StrikePanel-Follow" ^
  /tr "cmd /c cd /d \"%WORKDIR%\" && %NODE% scripts/marketing/run-follow.js >> \"%LOGDIR%\run-follow.log\" 2>&1" ^
  /sc DAILY ^
  /st 17:15 ^
  /rl HIGHEST ^
  /ru SYSTEM ^
  /f
if %ERRORLEVEL% EQU 0 (
    echo   [OK] StrikePanel-Follow registered
) else (
    echo   [WARN] StrikePanel-Follow may already exist or failed — check permissions
)
echo.

REM -------------------------------------------------------
REM Summary
REM -------------------------------------------------------
echo ============================================================
echo  All tasks registered. Verify in Task Scheduler:
echo    Start -> Task Scheduler -> Task Scheduler Library
echo    Look for: StrikePanel-*
echo.
echo  Log files will be written to:
echo    %LOGDIR%\run-daily.log
echo    %LOGDIR%\run-story.log
echo    %LOGDIR%\run-engage.log
echo    %LOGDIR%\run-follow.log
echo.
echo  IMPORTANT: If your PC clock is not set to Dubai time
echo  (UTC+4 / GST), adjust the /st times accordingly.
echo  Dubai 08:00 = UTC 04:00
echo  Dubai 17:00 = UTC 13:00
echo ============================================================
echo.
pause
