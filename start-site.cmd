@echo off
setlocal
set "NODE_HOME=C:\Program Files\nodejs"

if not exist "%NODE_HOME%\node.exe" (
  echo Node.js was not found at "%NODE_HOME%".
  echo Install Node.js LTS, then run this file again.
  pause
  exit /b 1
)

set "PATH=%NODE_HOME%;%PATH%"
echo Starting Mushroom Wonders...
echo Open http://localhost:3000/order.html in your browser.
echo Keep this window open while using the website.
call "%NODE_HOME%\npm.cmd" start
