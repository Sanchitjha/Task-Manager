#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"

echo "Starting terminology replacement..."

# Function to replace terms in a file
replace_in_file() {
    local file="$1"
    if [ -f "$file" ]; then
        # Replace vendor terms
        sed -i 's/\bvendorId\b/partnerId/g' "$file"
        sed -i 's/\bVendorId\b/PartnerId/g' "$file"
        sed -i 's/\bvendorIds\b/partnerIds/g' "$file"
        sed -i 's/\bvendorEmail\b/partnerEmail/g' "$file"
        sed -i 's/\bvendorAddress\b/partnerAddress/g' "$file"
        sed -i 's/\bvendorProfile\b/partnerProfile/g' "$file"
        sed -i 's/\bVendorProfile\b/PartnerProfile/g' "$file"
        sed -i 's/\bvendorReview\b/partnerReview/g' "$file"
        sed -i 's/\bVendorReview\b/PartnerReview/g' "$file"
        sed -i 's/\bvendors\b/partners/g' "$file"
        sed -i 's/\bVendors\b/Partners/g' "$file"
        sed -i 's/\bvendor\b/partner/g' "$file"
        sed -i 's/\bVendor\b/Partner/g' "$file"
        
        # Replace client terms
        sed -i 's/\bclientEmail\b/userEmail/g' "$file"
        sed -i 's/\bclientCount\b/userCount/g' "$file"
        sed -i 's/\bclients\b/users/g' "$file"
        sed -i 's/\bClients\b/Users/g' "$file"
        sed -i 's/\bclient\b/user/g' "$file"
        sed -i 's/\bClient\b/User/g' "$file"
        
        # Replace URL paths
        sed -i "s|'/vendor-|'/partner-|g" "$file"
        sed -i 's|"/vendor-|"/partner-|g' "$file"
        sed -i "s|'/vendors'|'/partners'|g" "$file"
        sed -i 's|"/vendors"|"/partners"|g' "$file"
        sed -i "s|'/clients'|'/users'|g" "$file"
        sed -i 's|"/clients"|"/users"|g' "$file"
        
        echo "Processed: $file"
    fi
}

# Process backend route files
echo "Processing backend routes..."
for file in backend/src/routes/*.js; do
    replace_in_file "$file"
done

# Process backend schema files
echo "Processing backend schemas..."
for file in backend/src/schemas/*.js; do
    replace_in_file "$file"
done

# Process backend lib files
echo "Processing backend lib files..."
for file in backend/src/lib/*.js; do
    replace_in_file "$file"
done

# Process backend middleware files
echo "Processing backend middleware..."
for file in backend/src/middleware/*.js; do
    replace_in_file "$file"
done

# Process backend test/utility files
echo "Processing backend utility files..."
for file in backend/*.js; do
    replace_in_file "$file"
done

# Process frontend pages
echo "Processing frontend pages..."
for file in frontend/src/pages/*.jsx frontend/src/pages/*.js; do
    replace_in_file "$file"
done

# Process frontend components
echo "Processing frontend components..."
for file in frontend/src/components/*.jsx frontend/src/components/*.js; do
    replace_in_file "$file"
done

# Process frontend contexts
echo "Processing frontend contexts..."
for file in frontend/src/contexts/*.jsx frontend/src/contexts/*.js; do
    replace_in_file "$file"
done

# Process frontend lib
echo "Processing frontend lib..."
for file in frontend/src/lib/*.jsx frontend/src/lib/*.js; do
    replace_in_file "$file"
done

echo "Terminology replacement complete!"
echo "Please review the changes and test thoroughly."
