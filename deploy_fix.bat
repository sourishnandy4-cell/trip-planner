@echo off
cd /d C:\Projects\Wandr
npm run build
git add -A
git commit -m "fix-loading-screen-missing-css-now-fullscreen-overlay"
git push origin main
echo Done.
