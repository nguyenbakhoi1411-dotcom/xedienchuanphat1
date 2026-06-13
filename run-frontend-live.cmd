@echo off
cd /d D:\ChuanPhat\frontend
"C:\Users\Acer\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" ".\node_modules\next\dist\bin\next" dev --hostname 0.0.0.0 --port 3000 > frontend-live.shell.log 2>&1
