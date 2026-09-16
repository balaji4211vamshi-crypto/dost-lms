#!/bin/bash
# DOST Academy System — force-restart the frontend dev server.
# Double-click this file in Finder.

cd "$(dirname "$0")/dost-lms-final"

echo "=== Stopping anything already running on port 3000 ==="
PIDS=$(lsof -ti:3000)
if [ -n "$PIDS" ]; then
    echo "Killing process(es): $PIDS"
    kill -9 $PIDS
    sleep 1
else
    echo "Nothing was running on port 3000."
fi

echo ""
echo "=== Clearing the React dev-server build cache ==="
rm -rf node_modules/.cache

echo ""
echo "=== Starting the frontend fresh at http://localhost:3000 ==="
echo "Leave this window open while you use the app. Close it to stop the server."
BROWSER=none npm start
