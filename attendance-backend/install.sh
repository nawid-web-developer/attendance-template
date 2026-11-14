#!/usr/bin/env bash
set -euo pipefail
npm install
echo "Backend installed. Start MySQL with: docker compose up -d"
echo "Then start the API with: npm run dev"
