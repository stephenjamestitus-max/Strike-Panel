@echo off
REM ============================================================
REM  StrikePanel — Windows Task Scheduler Setup
REM  Run this once as Administrator to register all 4 tasks.
REM
REM  CADENCE:
REM    Post + Story — every 3 days (scripts self-enforce this)
REM    Engage + Follow — every day
REM
REM  All times are Dubai (UTC+4). Windows Task Scheduler
REM  uses LOCAL time — adjust /st times if your PC is not
REM  set to Dubai/GST (UTC+4).
REM
REM  Schedule:
REM    08:00 — Post     (runs, skips if <3 days since last)
REM    08:10 — Story    (runs, skips if <3 days since last)
REM    17:00 — Engage   (15 comments generated, every day)
REM    17:15 — Follow   (5 accounts, every day)
REM ============================================================

SET WORKDIR=C:\Users\steph\Strike-Panel
SET LOGDIR=C:\Users\steph\Strike-Panel\logs
SET NODE=node

echo.
echo === StrikePanel Task Scheduler Setup ===
echo Working directory: %WORKDIR%
echo Logs:              %LOGDIR%
echo.

if not exist "%LOGDIR%" mkdir "%LOGDIR%"

REM -------------------------------------------------------
REM Task 1: Post — runs daily, script enforces 3-day gap
REM -------------------------------------------------------
echo Registering StrikePanel-Post (08:00 daily)...
schtasks /create ^
  /tn "StrikePanel-Post" ^
  /tr "cmd /c cd /d \"%WORKDIR%\" && %NODE% scripts/marketing/run-daily.js >> \"%LOGDIR%\run-daily.log\" 2>&1" ^
  /sc DAILY /st 08:00 /rl HIGHEST /ru SYSTEM /f
if %ERRORLEVEL% EQU 0 (echo   [OK]) else (echo   [FAIL] — run as Administrator)

REM -------------------------------------------------------
REM Task 2: Story — runs daily, script enforces 3-day gap
REM -------------------------------------------------------
echo Registering StrikePanel-Story (08:10 daily)...
schtasks /create ^
  /tn "StrikePanel-Story" ^
  /tr "cmd /c cd /d \"%WORKDIR%\" && %NODE% scripts/marketing/run-story.js >> \"%LOGDIR%\run-story.log\" 2>&1" ^
  /sc DAILY /st 08:10 /rl HIGHEST /ru SYSTEM /f
if %ERRORLEVEL% EQU 0 (echo   [OK]) else (echo   [FAIL] — run as Administrator)

REM -------------------------------------------------------
REM Task 3: Engage — every day at 5 PM Dubai
REM -------------------------------------------------------
echo Registering StrikePanel-Engage (17:00 daily)...
schtasks /create ^
  /tn "StrikePanel-Engage" ^
  /tr "cmd /c cd /d \"%WORKDIR%\" && %NODE% scripts/marketing/run-engage.js >> \"%LOGDIR%\run-engage.log\" 2>&1" ^
  /sc DAILY /st 17:00 /rl HIGHEST /ru SYSTEM /f
if %ERRORLEVEL% EQU 0 (echo   [OK]) else (echo   [FAIL] — run as Administrator)

REM -------------------------------------------------------
REM Task 4: Follow — every day at 5:15 PM Dubai
REM -------------------------------------------------------
echo Registering StrikePanel-Follow (17:15 daily)...
schtasks /create ^
  /tn "StrikePanel-Follow" ^
  /tr "cmd /c cd /d \"%WORKDIR%\" && %NODE% scripts/marketing/run-follow.js >> \"%LOGDIR%\run-follow.log\" 2>&1" ^
  /sc DAILY /st 17:15 /rl HIGHEST /ru SYSTEM /f
if %ERRORLEVEL% EQU 0 (echo   [OK]) else (echo   [FAIL] — run as Administrator)

echo.
echo ============================================================
echo  Done. Verify in Task Scheduler (Start menu):
echo    Task Scheduler Library - look for StrikePanel-*
echo.
echo  What runs when:
echo    08:00  Post   — every 3 days (auto-enforced)
echo    08:10  Story  — every 3 days (auto-enforced)
echo    17:00  Engage — EVERY DAY (15 comments to engage_queue.json)
echo    17:15  Follow — EVERY DAY (5 accounts to follow_log.json)
echo.
echo  Logs: %LOGDIR%\
echo.
echo  Dubai time = UTC+4. If your PC clock is not Dubai,
echo  adjust: Dubai 08:00 = UTC 04:00 / Dubai 17:00 = UTC 13:00
echo ============================================================
pause
