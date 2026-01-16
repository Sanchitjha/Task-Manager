#!/bin/bash

# Simple build script for Render deployment
echo "==> Starting Task Manager API build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in current directory"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "Error: backend directory not found"
    echo "Current directory contents:"
    ls -la
    exit 1
fi

# Install root dependencies first
echo "==> Installing root dependencies..."
npm install

# Install backend dependencies
echo "==> Installing backend dependencies..."
cd backend
npm install

echo "==> Build completed successfully!"