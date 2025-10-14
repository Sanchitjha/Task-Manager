# Admin Hierarchy System - Complete Implementation

## Overview
A comprehensive three-tier user management system with approval workflows, role-based access control, and client management capabilities.

## User Hierarchy

### 1. Admin (Top Level)
**Capabilities:**
- Manage all videos (add/edit/delete)
- Register new admins
- View all sub-admins (approved and pending)
- Approve/revoke sub-admin access
- Delete sub-admins
- View all clients across all sub-admins
- View detailed statistics for all users
- Access admin dashboard at `/admin/dashboard`

### 2. Sub-Admin (Middle Level)
**Capabilities:**
- Add and manage their own clients only
- View detailed statistics for their clients
- Track client video watching activity
- View client transaction history
- Access sub-admin dashboard at `/subadmin/dashboard`

**Restrictions:**
- Cannot access system until approved by admin
- Cannot manage videos
- Cannot see or manage clients added by other sub-admins
- Cannot register other sub-admins or admins

### 3. Client (Base Level)
**Capabilities:**
- Watch videos and earn coins
- Redeem coins to wallet
- View their own profile and transactions

## Backend API Endpoints

### Admin Management Routes (`/api/admin`)

#### Sub-Admin Management
```
GET    /subadmins/pending          Get all pending sub-admin approvals
GET    /subadmins                  Get all sub-admins with client count
GET    /subadmins/:id              Get specific sub-admin with their clients
POST   /subadmins/:id/approve      Approve a sub-admin
POST   /subadmins/:id/revoke       Revoke sub-admin approval
PATCH  /subadmins/:id              Update sub-admin details
DELETE /subadmins/:id              Delete sub-admin
```

#### Client Management
```
POST   /clients                    Add new client (Admin or Sub-admin)
GET    /clients                    Get clients (filtered by role)
GET    /clients/:id                Get specific client details
PATCH  /clients/:id                Update client details
DELETE /clients/:id                Delete client
```

#### Dashboard Statistics
```
GET    /dashboard/stats            Get admin dashboard statistics
GET    /dashboard/subadmin-stats   Get sub-admin dashboard statistics
```

### Registration Routes (`/api/auth`)

```
POST   /register                   Public client registration
POST   /register-subadmin          Sub-admin registration (pending approval)
POST   /register-admin             Admin registration (admin-only)
POST   /login                      Login with approval check
```

## Database Schema Changes

### User Model Additions
```javascript
{
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}
```

## Frontend Pages

### 1. Admin Dashboard (`/admin/dashboard`)
**Features:**
- Statistics cards showing total sub-admins, pending approvals, total clients
- Pending Approvals tab - Approve/reject sub-admin requests
- All Sub-Admins tab - View all sub-admins with their status and client count
- Sub-Admin Details view - Deep dive into specific sub-admin's clients with statistics

**Actions:**
- Approve pending sub-admins
- Revoke existing sub-admin approvals
- Delete sub-admins
- View detailed client information for any sub-admin

### 2. Sub-Admin Dashboard (`/subadmin/dashboard`)
**Features:**
- Statistics showing total and active clients
- Add Client modal with form validation
- My Clients list with statistics (videos watched, coins earned)
- Client Details view with transaction history and video watch history

**Actions:**
- Add new clients
- View client details
- Delete their own clients
- Track client earning activities

**Special Handling:**
- Shows "Pending Approval" screen if not yet approved by admin
- Can only see and manage clients they personally added

## Access Control Flow

### Registration Flow
1. **Client Registration:** Public → Immediate access
2. **Sub-Admin Registration:** Public → Pending approval → Admin approval → Access granted
3. **Admin Registration:** Admin-only → Immediate access

### Login Flow
```
User enters credentials
    ↓
Authentication successful
    ↓
Check user role
    ↓
If sub-admin → Check isApproved
    ↓
If not approved → Block login with message
    ↓
If approved → Grant access
```

### Authorization Middleware

#### `auth()`
- Validates JWT token
- Checks if sub-admin is approved
- Blocks unapproved sub-admins

#### `adminOnly()`
- Requires admin role
- Used for: video management, sub-admin approval, admin registration

#### `adminOrSubadmin()`
- Allows both admin and approved sub-admin
- Used for: client management (with filtering)

## Navigation Updates

### Admin Navigation
- Earn
- Wallet
- Shop
- Profile
- **Admin Dashboard** (new)
- **Admin Panel** (existing)

### Sub-Admin Navigation
- Earn
- Wallet
- Shop
- Profile
- **My Dashboard** (new)

### Client Navigation
- Earn
- Wallet
- Shop
- Profile

## Key Features

### 1. Approval Workflow
- Sub-admins register but cannot login until approved
- Admin receives notification (pending count badge)
- Admin can approve or reject with one click
- Approved sub-admins can immediately access their dashboard

### 2. Client Isolation
- Sub-admins only see clients with `addedBy` field matching their user ID
- Admins see all clients regardless of who added them
- Cannot modify or delete clients added by other sub-admins

### 3. Statistics & Tracking
- Real-time client activity monitoring
- Video watch completion tracking
- Coins earned and redeemed analytics
- Transaction history per client

### 4. Role-Based UI
- Dynamic navbar based on user role
- Conditional route rendering
- Access denied screens for unauthorized access
- Pending approval screen for unapproved sub-admins

## Security Considerations

1. **JWT Token Validation:** All protected routes require valid token
2. **Role Verification:** Middleware checks user role from database
3. **Approval Status:** Sub-admins blocked until manually approved
4. **Owner Verification:** Sub-admins can only manage their own clients
5. **Admin-Only Actions:** Video management and user approvals restricted to admins

## Testing Checklist

### Admin Functionality
- [ ] Register new admin
- [ ] View pending sub-admin approvals
- [ ] Approve sub-admin
- [ ] Revoke sub-admin approval
- [ ] View all sub-admins with client counts
- [ ] View specific sub-admin's clients
- [ ] Delete sub-admin
- [ ] Manage videos (add/edit/delete)
- [ ] View dashboard statistics

### Sub-Admin Functionality
- [ ] Register as sub-admin (pending state)
- [ ] Login blocked when not approved
- [ ] Login successful after approval
- [ ] Add new client
- [ ] View only own clients
- [ ] View client detailed statistics
- [ ] Delete own client
- [ ] Cannot access admin routes
- [ ] Cannot manage videos

### Client Functionality
- [ ] Register as client
- [ ] Immediate login access
- [ ] Watch videos and earn coins
- [ ] Redeem coins to wallet
- [ ] View transaction history

## File Structure

### Backend
```
backend/src/
├── routes/
│   ├── admin.js          (NEW - Admin management routes)
│   ├── auth.js           (UPDATED - Split registration)
│   ├── videos.js         (UPDATED - Admin-only)
│   └── ...
├── middleware/
│   └── auth.js           (UPDATED - Approval checks)
├── schemas/
│   └── User.js           (UPDATED - Approval fields)
└── index.js              (UPDATED - Register admin routes)
```

### Frontend
```
frontend/src/
├── pages/
│   ├── AdminDashboard.jsx      (NEW)
│   ├── SubAdminDashboard.jsx   (NEW)
│   └── ...
├── components/
│   └── Navbar.jsx              (UPDATED - Role-based links)
└── App.jsx                     (UPDATED - New routes)
```

## Usage Examples

### Admin Approving Sub-Admin
1. Admin navigates to `/admin/dashboard`
2. Clicks "Pending Approvals" tab
3. Sees list of sub-admins awaiting approval
4. Clicks "Approve" button
5. Sub-admin can now login and access system

### Sub-Admin Adding Client
1. Sub-admin navigates to `/subadmin/dashboard`
2. Clicks "Add Client" button
3. Fills in name, email, password
4. Submits form
5. Client immediately appears in their clients list
6. Client can login with provided credentials

### Admin Viewing Sub-Admin Activity
1. Admin navigates to `/admin/dashboard`
2. Clicks "All Sub-Admins" tab
3. Clicks "View Details" on any sub-admin
4. Sees all clients managed by that sub-admin
5. Views statistics: videos watched, coins earned, redeemed amounts

## Environment Setup

### Backend (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Running the System

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment Notes

1. **MongoDB Indexes:** Add indexes on `addedBy`, `isApproved`, and `role` fields for performance
2. **Environment Variables:** Configure production API URLs and JWT secrets
3. **CORS:** Update CORS origin to match production frontend URL
4. **File Uploads:** Configure persistent storage for profile images (e.g., S3)
5. **Email Notifications:** Consider adding email notifications for sub-admin approvals

## Future Enhancements

1. **Email Notifications:** Notify sub-admins when approved
2. **Bulk Actions:** Approve/reject multiple sub-admins at once
3. **Advanced Analytics:** Charts and graphs for admin dashboard
4. **Client Search:** Search and filter clients by name, email, or activity
5. **Export Data:** Export client and transaction data to CSV/Excel
6. **Audit Logs:** Track all admin actions for compliance
7. **Sub-Admin Permissions:** Granular permissions for different sub-admin levels
8. **Client Self-Registration:** Allow clients to register directly with sub-admin code

---

**Implementation Date:** January 2025  
**Status:** Complete and Production Ready  
**Version:** 1.0.0
