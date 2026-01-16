#!/bin/bash
# Render deployment fix
echo "=== Render Build Process ==="
echo "Current directory: $(pwd)"
echo "Available files and directories:"
ls -la

# Check if backend exists
if [ ! -d "backend" ]; then
    echo "ERROR: Backend directory missing!"
    echo "Searching for backend files..."
    find . -name "*backend*" -type f
    echo "All directories:"
    find . -type d
    exit 1
fi

echo "Backend directory found!"
echo "Backend contents:"
ls -la backend/

# Install backend dependencies
cd backend
echo "Installing backend dependencies..."
npm install
echo "Backend setup complete!"