#!/bin/bash
# Wakhma Store - Auto-restart server script
# Restarts the server automatically if it crashes

cd /home/z/my-project

echo "[$(date)] Starting Wakhma Store server..."

while true; do
  echo "[$(date)] Launching next start..."
  npx next start -p 3000

  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE. Restarting in 3 seconds..."
  sleep 3
done
