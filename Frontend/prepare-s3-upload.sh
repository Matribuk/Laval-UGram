#!/bin/bash

# Script to prepare frontend files for S3 upload
# Usage: ./prepare-s3-upload.sh

UPLOAD_DIR="s3-upload"

echo "🧹 Cleaning old upload directory if exists..."
if [ -d "$UPLOAD_DIR" ]; then
  rm -rf "$UPLOAD_DIR"
fi

echo "📁 Creating upload directory..."
mkdir "$UPLOAD_DIR"

echo "📦 Extracting build files..."
if [ ! -d "build" ]; then
  echo "❌ Build folder not found. Run 'npm run build' first."
  exit 1
fi

# Copy all files from build to upload directory
cp -r build/* "$UPLOAD_DIR/"

echo "✅ Files ready for upload in $UPLOAD_DIR/"
echo "📊 Directory contents:"
ls -lh "$UPLOAD_DIR"
echo ""
echo "🚀 Next step: Upload all files from $UPLOAD_DIR/ to S3 bucket ugram-frontend-prod-team12"
echo "   Via AWS Console: Select all files in $UPLOAD_DIR/ and upload them"
