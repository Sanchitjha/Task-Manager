# Complete Step-by-Step Guide to Finish Terminology Changes

## What's Been Done ✅

1. **Backend Schemas - COMPLETED**
   - User.js: role enum updated, vendorAddress → partnerAddress
   - Product.js: vendor → partner
   - Order.js: vendor → partner
   - ProductSubscription.js: vendor → partner
   - VendorProfile.js: Schema renamed to PartnerProfile
   - VendorReview.js: Schema renamed to PartnerReview

2. **Backend Routes**
   - admin.js: client→user, vendor→partner (COMPLETED via sed)

## What Still Needs to be Done

### STEP 1: Run the Replacement Script

Open a new terminal (Ctrl+`) and run:

```bash
cd /workspaces/Task-Manager
bash replace_all.sh
```

This will automatically update all remaining .js and .jsx files.

### STEP 2: Manually Fix Route URL Paths

Some route paths need manual attention:

#### In `backend/src/routes/orders.js`:
- Line 256: Change route path from `/vendor-orders` to `/partner-orders`

#### In `backend/src/routes/vendor.js`:
- ALL routes that start with `/` need no change (they're relative)
- But the file should be renamed (see Step 3)

### STEP 3: Rename Files

These files need to be renamed:

**Backend:**
```bash
mv backend/src/routes/vendor.js backend/src/routes/partner.js
mv backend/src/schemas/VendorProfile.js backend/src/schemas/PartnerProfile.js  
mv backend/src/schemas/VendorReview.js backend/src/schemas/PartnerReview.js
```

**Frontend:**
```bash
mv frontend/src/pages/VendorDashboard.jsx frontend/src/pages/PartnerDashboard.jsx
mv frontend/src/pages/VendorSubscriptions.jsx frontend/src/pages/PartnerSubscriptions.jsx
```

### STEP 4: Update Import Statements

After renaming files, update imports:

#### In `backend/src/index.js`:
```javascript
// Change:
const vendorRoutes = require('./routes/vendor');
// To:
const partnerRoutes = require('./routes/partner');

// Change route mounting:
app.use('/api/vendor', vendorRoutes);
// To:
app.use('/api/partner', partnerRoutes);
```

#### In files that import VendorProfile or VendorReview:
```javascript
// Change:
const { VendorProfile } = require('../schemas/VendorProfile');
const { VendorReview } = require('../schemas/VendorReview');
// To:
const { PartnerProfile } = require('../schemas/PartnerProfile');
const { PartnerReview } = require('../schemas/PartnerReview');
```

### STEP 5: Update Frontend Routing

#### In `frontend/src/App.jsx` or routing configuration:
```jsx
// Change all routes:
<Route path="/vendor/*" /> // to:
<Route path="/partner/*" />

<Route path="/vendor/dashboard" /> // to:
<Route path="/partner/dashboard" />
```

### STEP 6: Update API Endpoints in Frontend

Search for all API calls in frontend:

```bash
cd frontend/src
grep -r "\/api\/vendor" .
grep -r "\/clients" .
```

Replace:
- `/api/vendor/*` → `/api/partner/*`
- `/api/admin/clients` → `/api/admin/users`
- `/api/admin/vendors` → `/api/admin/partners`

### STEP 7: Update Frontend Variable Names

The script will handle most of this, but double-check:
- `vendor` variables → `partner`
- `client` variables → `user`
- State variables like `vendors`, `clients` → `partners`, `users`

### STEP 8: Update Documentation Files

Run sed on all .md files:

```bash
cd /workspaces/Task-Manager
for file in *.md; do
    sed -i 's/\bvendor\b/partner/g' "$file"
    sed -i 's/\bVendor\b/Partner/g' "$file"
    sed -i 's/\bclient\b/user/g' "$file"
    sed -i 's/\bClient\b/User/g' "$file"
done
```

### STEP 9: Check for Hardcoded Values

Search for any remaining references:

```bash
cd /workspaces/Task-Manager
grep -r "client" backend/src frontend/src --include="*.js" --include="*.jsx" | grep -v node_modules
grep -r "vendor" backend/src frontend/src --include="*.js" --include="*.jsx" | grep -v node_modules
```

### STEP 10: Database Field Names (IMPORTANT)

The MongoDB documents in your database still have the old field names. You have two options:

**Option A: Keep compatibility (Recommended for now)**
- Leave existing documents unchanged
- New documents will use new field names
- Access both old and new names in queries

**Option B: Migrate data**
Create a migration script:

```javascript
// backend/migrate-fields.js
const mongoose = require('mongoose');
const { User } = require('./src/schemas/User');
const { Product } = require('./src/schemas/Product');
const { Order } = require('./src/schemas/Order');

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Update User documents
    await mongoose.connection.collection('users').updateMany(
        { role: 'vendor' },
        { $set: { role: 'partner' } }
    );
    
    await mongoose.connection.collection('users').updateMany(
        { role: 'client' },
        { $set: { role: 'user' } }
    );
    
    // Rename fields in users collection
    await mongoose.connection.collection('users').updateMany(
        { vendorAddress: { $exists: true } },
        { $rename: { 'vendorAddress': 'partnerAddress' } }
    );
    
    // Rename vendor field to partner in products
    await mongoose.connection.collection('products').updateMany(
        { vendor: { $exists: true } },
        { $rename: { 'vendor': 'partner' } }
    );
    
    // Rename vendor field to partner in orders
    await mongoose.connection.collection('orders').updateMany(
        { vendor: { $exists: true } },
        { $rename: { 'vendor': 'partner' } }
    );
    
    console.log('Migration complete!');
    process.exit(0);
}

migrate().catch(console.error);
```

Run it with:
```bash
node backend/migrate-fields.js
```

### STEP 11: Testing Checklist

Test each of these:

- [ ] Login as admin
- [ ] Login as subadmin  
- [ ] Login as user (formerly client)
- [ ] Login as partner (formerly vendor)
- [ ] Create a product as partner
- [ ] Place an order as user
- [ ] View orders as partner
- [ ] Admin can see all users and partners
- [ ] All API endpoints respond correctly
- [ ] No console errors in browser
- [ ] All navigation links work

### STEP 12: Fix Any Remaining Issues

Common issues to watch for:

1. **Case sensitivity**: Make sure role checks use correct case
   ```javascript
   // Correct:
   user.role === 'partner'  // lowercase
   user.role === 'user'     // lowercase
   ```

2. **Populate references**: 
   ```javascript
   // Make sure all populate calls use new field names:
   .populate('partner', 'name email')  // not 'vendor'
   ```

3. **Frontend display text**:
   - Button labels, headings, etc. should say "Partner" not "Vendor"
   - Forms should say "User" not "Client"

4. **Navigation menu items**:
   - Update all menu text
   - Update route links

## Quick Verification Commands

After making all changes, run these to verify:

```bash
# Check for any remaining "vendor" in code (excluding node_modules):
grep -r "role.*vendor" backend/src frontend/src

# Check for any remaining "client" in role checks:
grep -r "role.*client" backend/src frontend/src

# Check route definitions:
grep -r "router.get\|router.post" backend/src/routes/ | grep -i vendor
grep -r "router.get\|router.post" backend/src/routes/ | grep -i client
```

## If Something Breaks

1. Check browser console for errors
2. Check backend logs for errors
3. Verify API endpoint URLs match between frontend and backend
4. Verify role strings match exactly (case-sensitive)
5. Check that imports point to correctly renamed files

## Rollback Plan

If you need to rollback:
```bash
git status  # See what changed
git diff    # Review changes
git checkout -- <file>  # Rollback specific file
git reset --hard  # Rollback everything (CAUTION!)
```

Good luck! The bulk of the work is automated, you just need to run the script and handle the file renames and import updates.
