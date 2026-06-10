#!/bin/bash
# Wakhma Store - Supervisor with health check
# Automatically restarts the server if it becomes unresponsive

cd /home/z/my-project
LOG="/tmp/wakhma-server.log"

echo "[$(date)] Supervisor starting..."

while true; do
  echo "[$(date)] Starting server..." >> "$LOG"
  npx next start -p 3000 >> "$LOG" 2>&1 &
  SERVER_PID=$!
  
  # Wait for server to be ready
  for i in $(seq 1 15); do
    if curl -s -o /dev/null -w "" http://localhost:3000/ 2>/dev/null; then
      echo "[$(date)] Server ready (PID $SERVER_PID)" >> "$LOG"
      break
    fi
    sleep 1
  done
  
  # Health check loop
  while true; do
    sleep 5
    if ! curl -s -o /dev/null -m 5 http://localhost:3000/ 2>/dev/null; then
      echo "[$(date)] Server unresponsive! Killing PID $SERVER_PID" >> "$LOG"
      kill -9 $SERVER_PID 2>/dev/null
      wait $SERVER_PID 2>/dev/null
      break
    fi
  done
  
  echo "[$(date)] Restarting in 3s..." >> "$LOG"
  sleep 3
done
