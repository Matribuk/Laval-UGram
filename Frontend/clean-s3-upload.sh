#!/bin/bash

# Script to clean the S3 upload directory
# Usage: ./clean-s3-upload.sh

UPLOAD_DIR="s3-upload"

echo "🧹 Cleaning upload directory..."

if [ ! -d "$UPLOAD_DIR" ]; then
  echo "⚠️  Upload directory does not exist. Nothing to clean."
  exit 0
fi

rm -rf "$UPLOAD_DIR"
echo "✅ Upload directory cleaned successfully"
