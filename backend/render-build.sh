#!/usr/bin/env bash
# Render build script for SocialDown backend

set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install FFmpeg (required by yt-dlp)
apt-get update
apt-get install -y ffmpeg

echo "Build completed successfully!"
