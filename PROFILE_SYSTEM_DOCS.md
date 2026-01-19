# Profile Settings System Documentation

## Overview
Comprehensive profile management system for all user roles (Admin, SubAdmin, Partner, User).

## Features Implemented

### 1. Profile Page (`/profile`)
- **Accessible by**: All authenticated users (all roles)
- **Features**:
  - Profile photo upload (max 5MB)
  - Name editing
  - Phone number editing
  - Email display (read-only - cannot be changed)
  - Role display with icons

### 2. Navbar Updates
**Desktop View**:
- Shows user's **name** instead of email
- Displays **profile photo** (circular avatar)
- Dropdown menu on click:
  - "Edit Profile" - links to `/profile`
  - "Logout" - logs out user
- Visual indicators: role badge, dropdown arrow animation

**Mobile View**:
- Shows profile photo with name
- "Edit Profile" button
- Logout button
- User role displayed

### 3. Backend Updates

#### Updated Endpoints:

**`PATCH /api/users/:id`**
- Allows updating: `name`, `phone`
- Prevents updating: `email` (returns 400 error)
- Authorization: User can only update their own profile (or admin)

**`POST /api/users/:id/profile-image`**
- Upload profile image
- Stores in `/uploads/profiles/`
- Authorization: User can only update their own profile (or admin)

**`GET /api/users/me/profile`** (NEW)
- Get current authenticated user's profile
- Returns user without password field

## User Flow

1. **After Login**: User sees their name and profile photo in navbar
2. **Click on Name**: Dropdown menu appears
3. **Click "Edit Profile"**: Navigate to profile settings page
4. **On Profile Page**:
   - Click profile photo to upload new image
   - Click "Edit" next to name/phone to modify
   - Email is displayed but cannot be changed
   - See current role with emoji indicator

## Security Features

- ✅ Users can only edit their own profile
- ✅ Admins can edit any user's profile
- ✅ Email changes are blocked (prevents account hijacking)
- ✅ File size validation (5MB max for images)
- ✅ Authentication required for all profile operations

## Field Restrictions

| Field | Editable | Notes |
|-------|----------|-------|
| Profile Photo | ✅ Yes | Max 5MB, images only |
| Name | ✅ Yes | Required field |
| Phone | ✅ Yes | Required field |
| Email | ❌ No | Cannot be changed for security |
| Role | ❌ No | Managed by admin only |

## UI/UX Features

- 🎨 Modern gradient design
- ⚡ Smooth animations and transitions
- 📱 Fully responsive (desktop & mobile)
- ✓ Real-time success/error messages
- 🔄 Auto-dismiss notifications (3 seconds)
- 🎭 Role-specific emoji indicators:
  - 👑 Admin
  - ⭐ SubAdmin
  - 🤝 Partner
  - 👤 User

## Technical Details

### Frontend Components
- **Profile.jsx**: Main profile settings page
- **Navbar.jsx**: Updated with profile dropdown
- Uses React hooks: `useState`, `useEffect`, `useRef`
- Context: `useAuth` for user data management

### Backend Routes
- **users.js**: Updated PATCH endpoint, added profile image upload
- Middleware: `auth` (authentication), `upload` (file upload)

### File Storage
- Profile images: `/backend/uploads/profiles/`
- Accessed via: `http://localhost:5000/uploads/profiles/filename`

## Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/profile` | Profile.jsx | All authenticated users |

## API Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/users/me/profile` | Get current user profile | ✅ Yes |
| PATCH | `/api/users/:id` | Update name/phone | ✅ Yes |
| POST | `/api/users/:id/profile-image` | Upload profile photo | ✅ Yes |

## Testing Checklist

- [ ] Admin can edit profile
- [ ] SubAdmin can edit profile
- [ ] Partner can edit profile
- [ ] User can edit profile
- [ ] Profile photo upload works
- [ ] Name editing works
- [ ] Phone editing works
- [ ] Email cannot be changed (shows error)
- [ ] Navbar shows name instead of email
- [ ] Navbar shows profile photo
- [ ] Dropdown menu works on desktop
- [ ] Mobile menu shows profile correctly
- [ ] Changes persist after refresh
- [ ] Only user can edit their own profile
- [ ] Admin can edit other users' profiles

## Future Enhancements

Potential features to add:
- Password change functionality
- Two-factor authentication
- Profile privacy settings
- Email verification
- Phone verification
- Profile completion indicator
- Social media links
- Bio/description field
- Profile viewing by other users
- Activity log/history
