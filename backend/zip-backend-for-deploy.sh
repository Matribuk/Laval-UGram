#!/bin/bash

# Script to create deployment package for AWS Elastic Beanstalk
# Usage: ./zip-backend-for-deploy.sh

echo "🏗️  Building backend..."
npm run build

if [ ! -d "dist" ]; then
  echo "❌ Build failed: dist/ folder not found"
  exit 1
fi

echo "📦 Creating deployment package..."

# Create zip excluding files from .ebignore
zip -r ../backend-deploy.zip . \
  -x "node_modules/*" \
  -x "src/*" \
  -x "test/*" \
  -x "coverage/*" \
  -x ".git/*" \
  -x ".env*" \
  -x "*.log" \
  -x ".idea/*" \
  -x ".vscode/*" \
  -x "tsconfig*" \
  -x "jest.config.js" \
  -x "eslint.config.mjs" \
  -x ".eslintrc.js" \
  -x ".prettierrc" \
  -x "nest-cli.json" \
  -x "uploads/*" \
  -x "docker-compose.yml" \
  -x "Dockerfile" \
  -x ".DS_Store" \
  -x "*.swp" \
  -x "*.swo"

if [ -f "../backend-deploy.zip" ]; then
  echo "✅ Deployment package created: backend-deploy.zip"
  echo "📊 Package size:"
  ls -lh ../backend-deploy.zip | awk '{print $5}'
  echo ""
  echo "🚀 Next step: Upload backend-deploy.zip to Elastic Beanstalk"
else
  echo "❌ Failed to create deployment package"
  exit 1
fi
