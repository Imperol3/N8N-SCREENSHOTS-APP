#!/bin/bash

echo "=========================================="
echo "   n8n Screenshot App - Auto Deploy"
echo "=========================================="

echo "[1/5] Pulling latest changes..."
git pull origin browserless

echo "[2/5] Installing dependencies..."
npm install

echo "[3/5] Generating Prisma Client..."
npx prisma generate

echo "[4/5] Building application..."
npm run build

echo "[5/5] Restarting PM2 process..."
pm2 restart n8n-screenshot-app

echo "=========================================="
echo "   ✅ Deployment Complete!"
echo "=========================================="
