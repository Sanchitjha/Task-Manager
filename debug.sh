#!/bin/bash
echo "=== Render Build Debug ==="
echo "Current directory: $(pwd)"
echo "All contents:"
ls -la
echo "Looking for backend:"
find . -name "*backend*" -type d
echo "Git status:"
git status
echo "Git ls-files backend:"
git ls-files | head -20