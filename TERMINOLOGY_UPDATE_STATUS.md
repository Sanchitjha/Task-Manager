# Terminology Update Summary

## Completed Changes

### 1. Backend Schemas ✅
- **User.js**: Updated role enum from `['admin', 'subadmin', 'client', 'vendor']` to `['admin', 'subadmin', 'user', 'partner']`
- **User.js**: Renamed `vendorAddress` to `partnerAddress`
- **User.js**: Updated comment from "Client relationship" to "User relationship"
- **Product.js**: Changed `vendor` field to `partner`
- **Order.js**: Changed `vendor` field to `partner`
- **ProductSubscription.js**: Changed `vendor` field to `partner` and updated index
- **VendorProfile.js**: Renamed schema to `PartnerProfile`, model to `PartnerProfile`
- **VendorReview.js**: Renamed schema to `PartnerReview`, renamed `vendor` field to `partner`

### 2. Backend Routes ✅
- **admin.js**: Bulk replaced all instances of `client/Client` → `user/User` and `vendor/Vendor` → `partner/Partner` using sed

## Remaining Changes Needed

### Backend Routes (Manual Updates Required)
The following files still need vendor→partner and client→user replacements:

1. **orders.js** - Update:
   - `vendorId` → `partnerId`
   - `vendor` field references → `partner`
   - `.populate('vendor')` → `.populate('partner')`
   - `vendorAddress` → `partnerAddress`
   - Route `/vendor-orders` → `/partner-orders`
   - `isVendor` variable → `isPartner`
   - Comments mentioning vendor → partner

2. **products.js** - Update:
   - `vendor` field references → `partner`
   - `.populate('vendor')` → `.populate('partner')`
   - `req.query.vendor` → `req.query.partner`
   - Role check `'vendor'` → `'partner'`
   - Error messages mentioning vendor

3. **subscriptions.js** - Update:
   - All `vendor` references → `partner`
   - `vendorId` → `partnerId`
   - Comments and error messages

4. **vendor.js** - This file should be:
   - Renamed to `partner.js`
   - All internal references updated
   - Route paths updated

5. **wallet.js** - Update:
   - Any vendor-related endpoints
   - Comments and documentation

6. **auth.js** - Update:
   - Role checks for 'vendor' → 'partner'
   - Role checks for 'client' → 'user'

7. **videos.js** - Update:
   - Client references → user

### Backend Middleware
- **auth.js**: Update role checks from 'client'/'vendor' to 'user'/'partner'

### Backend Lib
- **receiptGenerator.js**: Update vendor references to partner
- **subscriptionCron.js**: Update any vendor references

### Backend Test/Utility Files
- **setup-new-user.js**: Update role enum and example users
- **create-test-users.js**: Update roles
- All other test files

### Frontend Files (Complete Overhaul Needed)
All frontend files need systematic updates:

1. **Pages:**
   - `VendorDashboard.jsx` → `PartnerDashboard.jsx`
   - `VendorSubscriptions.jsx` → `PartnerSubscriptions.jsx`
   - `SellerDashboard.jsx`, `SellerProfile.jsx`, etc. - Update all vendor references
   - Update API endpoints from `/vendor-` to `/partner-`
   - Update role checks from 'vendor' to 'partner'
   - Update role checks from 'client' to 'user'

2. **Components:**
   - Update any components that reference vendor/client roles

3. **Contexts:**
   - **AuthContext.jsx**: Update role references

### Documentation Files
All `.md` files need updates:
- README.md
- VIDEO_SYSTEM_README.md
- VIDEO_WATCH_SYSTEM_README.md
- WALLET_TRANSACTION_FLOW.md
- SUBSCRIPTION_SYSTEM.md
- And all other documentation

## Automated Script Created

A Python script `replace_terms.py` has been created at the root level that can perform all these replacements automatically. To run it:

```bash
python3 /workspaces/Task-Manager/replace_terms.py
```

This script will:
- Process all .js and .jsx files in backend/src (routes, schemas, lib, middleware)
- Process all .js and .jsx files in frontend/src
- Replace all variations of vendor/client terminology
- Preserve proper casing (vendor→partner, Vendor→Partner, vendors→partners)

## Manual Steps After Running Script

1. **Rename Files:**
   - `backend/src/routes/vendor.js` → `partner.js`
   - `backend/src/schemas/VendorProfile.js` → `PartnerProfile.js`
   - `backend/src/schemas/VendorReview.js` → `PartnerReview.js`
   - `frontend/src/pages/VendorDashboard.jsx` → `PartnerDashboard.jsx`
   - `frontend/src/pages/VendorSubscriptions.jsx` → `PartnerSubscriptions.jsx`
   - Any other files with "Vendor" in the name

2. **Update Imports:**
   - Update all imports of renamed files throughout the codebase
   - Update require/import statements for VendorProfile, VendorReview

3. **Update Routes in index.js:**
   - Change `/vendor` route mount point to `/partner`
   - Update any other route registrations

4. **Update Frontend Routing:**
   - Update React Router paths from `/vendor/*` to `/partner/*`
   - Update navigation links

5. **Update API Endpoint Constants:**
   - Any hardcoded API URLs need updating

6. **Database Migration (If Needed):**
   - The field names in MongoDB documents won't automatically update
   - May need to run migration scripts if you want to rename fields in existing data
   - However, the schema changes should handle new data correctly

## Testing Checklist

After making all changes:
- [ ] Test user authentication with all roles
- [ ] Test partner registration and login
- [ ] Test user (formerly client) functionality
- [ ] Test product creation by partners
- [ ] Test order placement
- [ ] Test admin dashboard
- [ ] Test all API endpoints
- [ ] Verify frontend displays correct terminology
- [ ] Check all documentation is updated

## Notes

- Some automatic replacements were completed via `sed` commands
- Terminal encountered issues preventing full automation
- The Python script is ready to complete remaining changes
- Care must be taken with URL paths and API endpoints to ensure consistency
