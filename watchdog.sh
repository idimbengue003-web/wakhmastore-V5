#!/bin/bash
# Wakhma Store - Watchdog that keeps the server running
cd /home/z/my-project

while true; do
  # Check if server is responding
  if ! curl -s -o /dev/null -m 3 http://localhost:3000/ 2>/dev/null; then
    echo "[$(date)] Server down! Restarting..." >> /tmp/watchdog.log
    pkill -f "node server.js" 2>/dev/null
    sleep 1
    node server.js >> /tmp/watchdog.log 2>&1 &
    sleep 5
  fi
  sleep 2
done
