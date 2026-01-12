# Product Subscription System Documentation

## 🎯 Overview

The Product Subscription System enables vendors to pay for publishing their products on the platform. Vendors must purchase subscriptions to make their products visible to customers.

## 💰 Pricing Model

**₹1 per image per day**

Formula: `Total Cost = Number of Images × Number of Days × ₹1`

### Examples:
- Product with 3 images for 7 days: `3 × 7 × 1 = ₹21`
- Product with 5 images for 30 days: `5 × 30 × 1 = ₹150`
- Product with 1 image for 90 days: `1 × 90 × 1 = ₹90`

## 🔄 Workflow

### 1. Vendor Creates Product
1. Vendor fills product details (title, price, description, etc.)
2. **Must upload at least 1 image** (required)
3. Product is created but **NOT published** initially
4. Vendor is redirected to subscription payment page

### 2. Subscription Payment
1. Vendor selects number of days (1-365)
2. System calculates total cost based on uploaded images
3. Quick select buttons available: 7, 15, 30, 60, 90 days
4. Vendor enters optional transaction ID
5. Vendor completes payment
6. Product is **immediately published** and visible to customers

### 3. Active Subscription
- Product remains visible to customers
- Vendor can view subscription details
- Days remaining are shown
- Warnings appear when < 3 days remaining

### 4. Expiry & Notifications
- **Automated check runs every hour** via cron job
- **Reminder sent 1 day before expiry** (daily at 9 AM)
- When subscription expires:
  - Product automatically becomes **unpublished** (invisible)
  - Vendor receives expiry notification
  - Admin receives expiry notification
  - Subscription status changes to "expired"

### 5. Renewal
- Vendor can renew expired subscriptions
- Vendor can renew active subscriptions before expiry
- New subscription is created with updated expiry date
- Product is republished if it was expired

## 📊 Database Schemas

### ProductSubscription Schema
```javascript
{
  product: ObjectId,              // Reference to Product
  vendor: ObjectId,               // Reference to User (vendor)
  numberOfDays: Number,           // Selected duration
  numberOfImages: Number,         // Number of product images
  pricePerImagePerDay: Number,    // Always ₹1
  totalAmount: Number,            // Total payment
  startDate: Date,                // Subscription start
  endDate: Date,                  // Subscription expiry
  paymentStatus: String,          // pending, paid, failed, refunded
  paymentMethod: String,          // online, etc.
  transactionId: String,          // Payment transaction ID
  status: String,                 // active, expired, cancelled, pending
  expiryNotificationSent: Boolean,
  renewalCount: Number,           // How many times renewed
  previousSubscription: ObjectId  // Link to previous subscription
}
```

### Updated Product Schema
```javascript
{
  // ... existing fields
  isPublished: Boolean,           // false by default
  requiresSubscription: Boolean,  // true by default
  currentSubscription: ObjectId,  // Active subscription
  subscriptionExpiry: Date,       // Quick reference
  subscriptionHistory: [ObjectId] // All subscriptions
}
```

## 🔌 API Endpoints

### Vendor Endpoints

#### Calculate Subscription Cost
```
POST /api/subscriptions/calculate
Body: { numberOfImages, numberOfDays }
Response: { calculation: { totalAmount, breakdown } }
```

#### Create Subscription
```
POST /api/subscriptions/create
Body: { productId, numberOfDays }
Response: { subscription, paymentRequired }
```

#### Complete Payment
```
POST /api/subscriptions/:subscriptionId/pay
Body: { transactionId, paymentMethod }
Response: { success, subscription, expiryDate }
```

#### Get My Subscriptions
```
GET /api/subscriptions/my-subscriptions?status=active
Response: { subscriptions }
```

#### Renew Subscription
```
POST /api/subscriptions/:subscriptionId/renew
Body: { numberOfDays, transactionId }
Response: { subscription }
```

### Admin Endpoints

#### Get All Subscriptions
```
GET /api/subscriptions/admin/all?status=active&page=1
Response: { subscriptions, stats, total, pages }
```

#### Delete Subscription
```
DELETE /api/subscriptions/admin/:subscriptionId
Response: { success, message }
```

## 🤖 Automated Tasks (Cron Jobs)

### Expired Subscriptions Check
- **Frequency:** Every hour (`0 * * * *`)
- **Actions:**
  - Find active subscriptions with `endDate <= now`
  - Mark as expired
  - Unpublish products
  - Send notifications to vendor and admin
  - Update subscription status

### Expiring Soon Reminder
- **Frequency:** Daily at 9:00 AM (`0 9 * * *`)
- **Actions:**
  - Find subscriptions expiring within 24 hours
  - Send reminder notifications
  - Encourage vendors to renew

### Initial Check on Startup
- Runs 5 seconds after server starts
- Catches any subscriptions that expired while server was down

## 🎨 Frontend Pages

### 1. ProductSubscriptionPayment (`/subscription/payment/:productId`)
- Vendor payment page
- Shows product details and images
- Duration selector with quick buttons
- Cost breakdown
- Payment form
- Redirects to inventory after success

### 2. VendorSubscriptions (`/seller/subscriptions`)
- Vendor's subscription dashboard
- Filter by status (all, active, pending, expired)
- Grid view of all products with subscription details
- Days remaining indicator
- Renew buttons
- Edit product links

### 3. AdminSubscriptions (`/admin/subscriptions`)
- Admin management page
- View all vendor subscriptions
- Filter and pagination
- Revenue statistics
- Delete subscriptions
- Automatic product unpublish on delete

## 📧 Notifications

### Expiry Notification
**Triggered:** When subscription expires
**Recipients:** Vendor + All Admins
**Content:**
- Product name and ID
- Vendor details
- Expiry date
- Action required (renew)

### Reminder Notification
**Triggered:** 1 day before expiry
**Recipients:** Vendor + All Admins
**Content:**
- Product expiring tomorrow
- Current days remaining
- Renewal link

## 🔐 Access Control

### Vendor Access
- ✅ Create subscriptions for own products
- ✅ View own subscriptions
- ✅ Renew own subscriptions
- ✅ Pay for subscriptions
- ❌ View other vendors' subscriptions
- ❌ Delete subscriptions

### Admin Access
- ✅ View all subscriptions
- ✅ Delete any subscription
- ✅ Filter and search subscriptions
- ✅ View statistics
- ✅ Receive expiry notifications
- ✅ Force unpublish products

## 🚀 Product Creation Flow

```
Vendor → Create Product Form
  ↓
Product Created (unpublished)
  ↓
Redirect to Subscription Payment
  ↓
Select Days + Enter Transaction ID
  ↓
Complete Payment
  ↓
Product Published ✓
  ↓
Visible to Customers
```

## 🔄 Subscription Lifecycle

```
PENDING → PAY → ACTIVE → [Renewal?] → EXPIRED
                    ↓
              Auto-Unpublish
              Notifications Sent
```

## 💡 Key Features

### For Vendors
- ✅ Transparent pricing (₹1 per image per day)
- ✅ Flexible duration (1-365 days)
- ✅ Quick duration selection
- ✅ View all subscriptions
- ✅ Renewal before/after expiry
- ✅ Days remaining warnings
- ✅ Email notifications

### For Admins
- ✅ Complete subscription visibility
- ✅ Revenue tracking
- ✅ Delete capability
- ✅ Automatic expiry handling
- ✅ Notification on expiries
- ✅ Statistics dashboard

### Automation
- ✅ Hourly expiry checks
- ✅ Daily reminder at 9 AM
- ✅ Auto-unpublish on expiry
- ✅ Notification system
- ✅ Startup recovery check

## 🛡️ Security & Validation

- Product must have at least 1 image
- Only product owner can create subscription
- Payment required to activate
- Atomic transactions (all-or-nothing)
- Subscription linked to product permanently
- Admin-only delete capability

## 📈 Future Enhancements

Possible improvements:
- [ ] Email/SMS notifications (currently logs only)
- [ ] Automatic renewal option
- [ ] Bulk subscription purchase
- [ ] Discount codes for subscriptions
- [ ] Subscription packages (e.g., 10 products bundle)
- [ ] Grace period (1-2 days after expiry)
- [ ] Payment gateway integration
- [ ] Invoice generation
- [ ] Subscription analytics dashboard

## 🧪 Testing

To test the subscription system:

1. **Create a test vendor:**
   ```bash
   cd backend
   node setup-test-users.js
   ```

2. **Create a product:**
   - Login as vendor
   - Go to /seller/products/new
   - Fill form and upload images
   - You'll be redirected to payment

3. **Complete subscription:**
   - Select 1 day for testing
   - Complete payment
   - Product should be published

4. **Test expiry (manual):**
   ```javascript
   // In MongoDB or through API
   // Update endDate to past date
   db.productsubscriptions.updateOne(
     { _id: subscriptionId },
     { $set: { endDate: new Date('2020-01-01') } }
   );
   ```

5. **Trigger cron manually:**
   - Server restart will run check after 5 seconds
   - Or wait for hourly cron

6. **Verify:**
   - Product should be unpublished
   - Subscription status = expired
   - Notifications logged in console

## 📝 Notes

- Subscriptions cannot be deleted by vendors
- Deleted subscriptions maintain history (soft delete)
- Products can have multiple subscriptions (history)
- Current subscription is tracked on product
- Cron jobs run regardless of user activity
- Notifications currently log to console (integrate with email service)

---

## 🎉 Summary

The subscription system provides a complete pay-per-publish model where:
1. Vendors pay ₹1 per image per day
2. Products auto-publish on payment
3. Products auto-unpublish on expiry
4. Automated notifications keep everyone informed
5. Admins have full oversight and control
6. Renewals are simple and straightforward

**This creates a sustainable revenue model while maintaining automatic product lifecycle management!**
