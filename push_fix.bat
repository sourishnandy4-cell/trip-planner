@echo off
cd /d C:\Projects\Wandr
git add .
git commit -m "fix: call isMockMode as function not reference"
git push origin main
echo DONE
pause
