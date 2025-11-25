@echo off
echo ==========================================
echo      n8n Screenshot App - Quick Push
echo ==========================================
echo.

set /p msg="Enter commit message (Press Enter for 'update'): "
if "%msg%"=="" set msg="update"

echo.
echo [1/3] Staging changes...
git add .

echo [2/3] Committing...
git commit -m "%msg%"

echo [3/3] Pushing to browserless branch...
git push origin browserless

echo.
echo ==========================================
echo      ✅ Done! Changes pushed.
echo ==========================================
pause
