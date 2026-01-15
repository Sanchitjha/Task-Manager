#!/bin/bash
# Render build script
echo "Building The Manager API..."
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Install dependencies in the backend directory
if [ -d "backend" ]; then
    echo "Backend directory found, installing dependencies..."
    cd backend
    npm install
    echo "Backend dependencies installed successfully!"
else
    echo "ERROR: Backend directory not found!"
    exit 1
fi