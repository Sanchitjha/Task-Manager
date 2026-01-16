#!/usr/bin/env python3
import os
import re

# Define replacements - order matters!
replacements = [
    # Variable names and identifiers
    (r'\bvendorId\b', 'partnerId'),
    (r'\bVendorId\b', 'PartnerId'),
    (r'\bvendorIds\b', 'partnerIds'),
    (r'\bvendorEmail\b', 'partnerEmail'),
    (r'\bvendorAddress\b', 'partnerAddress'),
    (r'\bvendorProfile\b', 'partnerProfile'),
    (r'\bVendorProfile\b', 'PartnerProfile'),
    (r'\bvendorReview\b', 'partnerReview'),
    (r'\bVendorReview\b', 'PartnerReview'),
    (r'\bvendors\b', 'partners'),
    (r'\bVendors\b', 'Partners'),
    (r'\bvendor\b', 'partner'),
    (r'\bVendor\b', 'Partner'),
    
    # Client replacements
    (r'\bclientEmail\b', 'userEmail'),
    (r'\bclientCount\b', 'userCount'),
    (r'\bclients\b', 'users'),
    (r'\bClients\b', 'Users'),
    (r'\bclient\b', 'user'),
    (r'\bClient\b', 'User'),
    
    # URL paths - be careful with these
    (r'/vendor-', '/partner-'),
    (r'/vendors', '/partners'),
    (r"'/clients'", "'/users'"),
    (r'"/clients"', '"/users"'),
]

def process_file(filepath):
    """Process a single file with all replacements"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        # Only write if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    # Process backend routes
    routes_dir = '/workspaces/Task-Manager/backend/src/routes'
    schemas_dir = '/workspaces/Task-Manager/backend/src/schemas'
    lib_dir = '/workspaces/Task-Manager/backend/src/lib'
    middleware_dir = '/workspaces/Task-Manager/backend/src/middleware'
    
    # Frontend
    frontend_pages = '/workspaces/Task-Manager/frontend/src/pages'
    frontend_components = '/workspaces/Task-Manager/frontend/src/components'
    
    dirs_to_process = [
        routes_dir,
        schemas_dir, 
        lib_dir,
        middleware_dir,
        frontend_pages,
        frontend_components
    ]
    
    files_changed = 0
    
    for directory in dirs_to_process:
        if not os.path.exists(directory):
            print(f"Directory not found: {directory}")
            continue
            
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(('.js', '.jsx')):
                    filepath = os.path.join(root, file)
                    if process_file(filepath):
                        files_changed += 1
                        print(f"Updated: {filepath}")
    
    print(f"\nTotal files changed: {files_changed}")

if __name__ == '__main__':
    main()
