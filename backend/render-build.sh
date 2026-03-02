#!/usr/bin/env bash
# Render build script for SocialDown backend

set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo "Build completed successfully!"
echo "Note: FFmpeg is not available on free tier. Video downloads may have limited functionality."
