#!/bin/bash
cd /workspace/dominicstasks
npm run dev -- --host 0.0.0.0 &
sleep 8
echo "Dev server should be running on port 5173"
curl -s http://localhost:5173 | head -5
