#!/bin/bash
# Render build script
echo "Building The Manager API..."
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Ensure backend directory exists
if [ ! -d "backend" ]; then
    echo "ERROR: Backend directory not found!"
    echo "Available directories:"
    find . -type d -maxdepth 2
    exit 1
fi

echo "Backend directory found, installing dependencies..."
cd backend
echo "Installing backend dependencies..."
npm install
echo "Backend dependencies installed successfully!"