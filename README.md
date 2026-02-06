# 🛍️ Task Manager - E-Commerce Platform

A comprehensive full-stack e-commerce platform built with **React**, **Node.js**, and **MongoDB**. This platform enables users to shop, earn coins, manage orders, and partners to sell products with a modern, responsive UI.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Key Features by Role](#key-features-by-role)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Task Manager is an innovative e-commerce platform that revolutionizes online shopping by introducing a **coin-based reward system**. Users can earn coins by watching educational videos and use those coins to get discounts on purchases from partner sellers.

**Key Value Propositions:**
- 💰 Earn coins by watching videos
- 🎁 Use coins to unlock discounts
- 🏪 Partner sellers can manage their inventory and sales
- 📊 Admin dashboard for platform oversight
- 📱 Mobile-responsive design
- 🔐 Secure authentication with JWT tokens
- 📧 Email OTP verification

---

## ✨ Features

### User Features
- ✅ **User Registration & Authentication**: Email/password signup with OTP verification
- ✅ **Coin System**: Earn coins by watching educational videos
- ✅ **Shopping**: Browse products, add to cart, checkout
- ✅ **Discount Application**: Use coins for discounts on purchases
- ✅ **Order Management**: Track orders, view order history
- ✅ **Profile Management**: Edit name, phone, upload profile photo
- ✅ **Wallet**: View coin balance and transaction history
- ✅ **Video Watch System**: Track video progress and coins earned
- ✅ **Reviews & Ratings**: Rate purchased products
- ✅ **Wishlist Integration**: Save favorite products

### Partner Features
- ✅ **Store Management**: Create and manage product inventory
- ✅ **Sales Dashboard**: Track sales, revenue, and coins earned
- ✅ **Product Management**: Add, edit, delete, and publish products
- ✅ **Order Processing**: Accept and fulfill customer orders
- ✅ **In-Store Purchases**: Process offline purchases using coin discounts
- ✅ **Shop Profile**: Manage shop details and location
- ✅ **Performance Reports**: Detailed sales analytics and reports
- ✅ **Subscription Plans**: Tier-based partner tiers with benefits
- ✅ **Review Management**: View and respond to customer reviews

### Admin Features
- ✅ **Dashboard**: Comprehensive platform analytics
- ✅ **User Management**: View and manage all users
- ✅ **Partner Management**: Approve/block partners, manage shops
- ✅ **Product Control**: Review and manage all products
- ✅ **Order Oversight**: Monitor all orders and transactions
- ✅ **Video Management**: Manage educational content library
- ✅ **Coin System Administration**: Control coin settings and rewards
- ✅ **Sub-Admin Management**: Create and manage sub-admin users
- ✅ **Settings Configuration**: Platform-wide settings

### Sub-Admin Features
- ✅ **Moderation**: Review pending content and transactions
- ✅ **User Support**: Assist users and resolve disputes
- ✅ **Content Management**: Help manage videos and products
- ✅ **Reports**: Access detailed platform reports

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library
- **React Router v7** - Client-side routing
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **Recharts** - Data visualization
- **Vite 7.3.1** - Build tool and dev server
- **PWA Support** - Progressive Web App capabilities

### Backend
- **Node.js / Express 5.1.0** - Server framework
- **MongoDB / Mongoose 8.19.0** - Database
- **JWT (jsonwebtoken 9.0.2)** - Authentication
- **Bcryptjs** - Password hashing
- **Multer 2.0.2** - File upload (profile images, product images)
- **SendGrid** - Email service
- **Node-Cron** - Scheduled tasks
- **Morgan** - HTTP logging
- **CORS** - Cross-origin resource sharing
- **PDFKit** - PDF receipt generation

### DevOps & Tools
- **Nodemon** - Development auto-reload
- **ESLint** - Code linting
- **Vercel** - Deployment platform (Frontend)
- **Render** - Deployment platform (Backend)
- **Git** - Version control

---

## 💻 Installation

### Prerequisites
- **Node.js** v16+ and **npm** v8+
- **MongoDB** (local or cloud - MongoDB Atlas)
- **Git**

### Clone the Repository
```bash
git clone https://github.com/Sanchitjha/Task-Manager.git
cd Task-Manager
```

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-manager

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5174

# Optional: Stripe (if using payment processing)
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend will run on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5174
```

### Production Build

**Frontend Build:**
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

**Backend Production:**
```bash
cd backend
npm start
```

Access the application:
- Frontend: http://localhost:5174 (dev) or your deployed URL
- Backend API: http://localhost:5000/api
- API Health: http://localhost:5000/health

---

## 📁 Project Structure

```
Task-Manager/
├── backend/
│   ├── src/
│   │   ├── index.js                 # Express app entry point
│   │   ├── lib/
│   │   │   ├── mongo.js            # MongoDB connection
│   │   │   ├── emailOtpService.js  # Email OTP logic
│   │   │   ├── otpService.js       # In-app OTP logic
│   │   │   └── receiptGenerator.js # PDF receipt generation
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT authentication
│   │   │   ├── upload.js           # Profile image upload
│   │   │   └── uploadProduct.js    # Product image upload
│   │   ├── routes/
│   │   │   ├── auth.js             # Auth endpoints (register, login)
│   │   │   ├── users.js            # User profile endpoints
│   │   │   ├── products.js         # Product CRUD
│   │   │   ├── partner.js          # Partner/vendor endpoints
│   │   │   ├── admin.js            # Admin endpoints
│   │   │   ├── videos.js           # Video management
│   │   │   ├── wallet.js           # Coin wallet endpoints
│   │   │   ├── orders.js           # Order management
│   │   │   ├── transactions.js     # Transaction history
│   │   │   └── subscriptions.js    # Partner subscription tiers
│   │   ├── schemas/
│   │   │   ├── User.js             # User model
│   │   │   ├── Product.js          # Product model
│   │   │   ├── Order.js            # Order model
│   │   │   ├── Video.js            # Video model
│   │   │   ├── VideoWatch.js       # Video watch tracking
│   │   │   ├── VendorProfile.js    # Partner shop profile
│   │   │   ├── Transaction.js      # Coin transactions
│   │   │   └── Setting.js          # Platform settings
│   │   └── uploads/
│   │       └── profiles/           # Stored user profile images
│   ├── package.json
│   └── .env                        # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # Entry point
│   │   ├── App.jsx                # Route definitions
│   │   ├── App.css                # Global styles
│   │   ├── index.css              # Tailwind CSS
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation header
│   │   │   ├── ProtectedRoute.jsx # Auth-gated routes
│   │   │   ├── InstallPrompt.jsx  # PWA install prompt
│   │   │   ├── OfflineIndicator.jsx # Offline status
│   │   │   └── LogoutButton.jsx   # Logout component
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration with role selection
│   │   │   ├── Home.jsx           # Landing/home page
│   │   │   ├── Profile.jsx        # User profile settings
│   │   │   ├── Products.jsx       # Product listing
│   │   │   ├── ProductDetail.jsx  # Product detail view
│   │   │   ├── Cart.jsx           # Shopping cart
│   │   │   ├── Checkout.jsx       # Order checkout
│   │   │   ├── Orders.jsx         # Order history
│   │   │   ├── Admin.jsx          # Admin dashboard
│   │   │   ├── AdminDashboard.jsx # Admin stats & controls
│   │   │   ├── AdminPartners.jsx  # Partner management
│   │   │   ├── AdminVideos.jsx    # Video management
│   │   │   ├── PartnerDashboard.jsx # Partner sales dashboard
│   │   │   ├── SellerInventory.jsx  # Partner product mgmt
│   │   │   ├── SellerOrders.jsx     # Partner order handling
│   │   │   ├── SellerProfile.jsx    # Partner shop profile
│   │   │   ├── VendorShop.jsx       # Partner shop view
│   │   │   ├── Earn.jsx            # Video watching to earn coins
│   │   │   └── [more pages...]
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx    # Global auth state
│   │   │   └── NotificationContext.jsx # Toast notifications
│   │   ├── hooks/
│   │   │   ├── useAuth.js         # Auth hook
│   │   │   ├── useNotifications.js # Toast hook
│   │   │   └── usePWA.js          # PWA hook
│   │   ├── lib/
│   │   │   └── api.js             # Axios instance + API helpers
│   │   └── utils/
│   │       └── auth.js            # Auth utilities
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   └── sw.js                  # Service Worker
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env                       # Environment variables
│
├── README.md                      # This file
├── package.json                   # Root package.json
└── .gitignore
```

---

## 🔌 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://task-manager-x6vw.onrender.com/api
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" | "partner" | "subadmin"
}

Response: { user, token }
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { user, token }
```

#### Send Email OTP
```http
POST /auth/send-email-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Verify OTP & Complete Registration
```http
POST /auth/verify-email-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otpCode": "123456",
  "name": "John Doe",
  "password": "password123"
}
```

### User Endpoints

#### Get Current User
```http
GET /users/me
Authorization: Bearer {token}
```

#### Get User Profile
```http
GET /users/{userId}
```

#### Update Profile
```http
PATCH /users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+919876543210"
}
```

#### Upload Profile Image
```http
POST /users/{userId}/profile-image
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- profileImage: [file]
```

### Product Endpoints

#### List Products
```http
GET /products?limit=20&offset=0&search=&category=
```

#### Get Product Details
```http
GET /products/{productId}
```

#### Create Product (Partner Only)
```http
POST /products
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- title, description, price, stock, category
- images: [files]
```

#### Update Product
```http
PUT /products/{productId}
Authorization: Bearer {token}
Content-Type: application/json
```

#### Delete Product
```http
DELETE /products/{productId}
Authorization: Bearer {token}
```

### Order Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    { "productId": "...", "quantity": 2, "coinDiscount": 100 }
  ],
  "totalAmount": 500,
  "coinsUsed": 100
}
```

#### Get User Orders
```http
GET /orders
Authorization: Bearer {token}
```

#### Get Order Details
```http
GET /orders/{orderId}
Authorization: Bearer {token}
```

### Wallet (Coins) Endpoints

#### Get Wallet Balance
```http
GET /wallet/balance
Authorization: Bearer {token}
```

#### Get Transaction History
```http
GET /wallet/transactions
Authorization: Bearer {token}
```

### Video Endpoints

#### List Videos
```http
GET /videos?limit=20&offset=0
```

#### Get Video
```http
GET /videos/{videoId}
```

#### Record Video Watch
```http
POST /videos/{videoId}/watch
Authorization: Bearer {token}
Content-Type: application/json

{
  "watchDuration": 300,
  "completed": true
}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /admin/dashboard
Authorization: Bearer {token}
```

#### Get All Partners
```http
GET /admin/partners
Authorization: Bearer {token}
```

#### Get All Products
```http
GET /admin/products
Authorization: Bearer {token}
```

#### Get All Orders
```http
GET /admin/orders
Authorization: Bearer {token}
```

---

## 👥 User Roles

### 1. **User (Client)**
- Regular customers
- Can browse and purchase products
- Can earn coins by watching videos
- Can apply coin discounts at checkout
- Can view order history and profile

### 2. **Partner (Vendor)**
- Sellers/merchants
- Can create and manage product listings
- Can process orders
- Can view sales analytics
- Can handle in-store purchases with coin validation
- Subscription tiers available (Silver, Gold, Platinum)

### 3. **Sub-Admin**
- Platform moderators
- Can assist with content management
- Can help resolve disputes
- Access to reports and analytics
- Cannot delete users or partners

### 4. **Admin**
- Full platform control
- User & partner management
- Content moderation
- Platform settings configuration
- Financial overview and reporting

---

## 🎯 Key Features by Role

### User Dashboard
- **Home**: Featured products, recommendations
- **Shop**: Browse all available products with filters
- **Earn**: Watch videos to earn coins
- **Cart**: Manage shopping cart
- **Checkout**: Apply coin discounts during purchase
- **Orders**: View purchase history and status
- **Wallet**: Check coin balance and transactions
- **Profile**: Update personal information and profile photo

### Partner Dashboard
- **Sales Overview**: Daily/weekly/monthly sales metrics
- **Inventory**: Add, edit, delete products
- **Orders**: View and process customer orders
- **In-Store Purchases**: Process offline transactions with coin validation
- **Analytics**: Detailed performance reports
- **Shop Profile**: Manage shop details, location, contact
- **Subscriptions**: Manage subscription tier and benefits
- **Reviews**: View and respond to customer reviews

### Admin Dashboard
- **Analytics**: Platform-wide statistics
- **Pending Approvals**: Sub-admin signups, partner verification
- **User Management**: View and manage all users
- **Partner Management**: Approve/block partners
- **Coin Management**: Monitor coin distribution and balance
- **Settings**: Configure platform parameters
- **Reports**: Export and view detailed reports

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: 'admin' | 'subadmin' | 'user' | 'partner',
  profileImage: String (path to image),
  isActive: Boolean,
  coinsBalance: Number,
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  originalPrice: Number,
  coinDiscount: Number,
  stock: Number,
  category: String,
  images: [String],
  partner: ObjectId (ref: User),
  isPublished: Boolean,
  ratings: Number,
  reviews: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId (ref: User),
  items: [
    {
      product: ObjectId,
      quantity: Number,
      price: Number,
      coinDiscount: Number
    }
  ],
  totalAmount: Number,
  coinsUsed: Number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  shippingAddress: String,
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Video Model
```javascript
{
  title: String,
  description: String,
  url: String (YouTube/hosted video),
  coinsReward: Number,
  duration: Number (in seconds),
  category: String,
  thumbnail: String,
  createdAt: Date,
  updatedAt: Date
}
```

### VideoWatch Model
```javascript
{
  user: ObjectId (ref: User),
  video: ObjectId (ref: Video),
  watchDuration: Number,
  completed: Boolean,
  coinsEarned: Number,
  watchedAt: Date
}
```

---

## 🔐 Authentication

### JWT Token Structure
```
Header: { alg: "HS256", typ: "JWT" }
Payload: { id: userId, role: userRole, iat: timestamp }
Signature: HMAC-SHA256(header.payload, JWT_SECRET)
```

### Token Features
- Tokens stored in localStorage on frontend
- Automatically attached to API requests via `Authorization` header
- Token expiration: 7 days (configurable)
- Refresh token mechanism for extended sessions (optional)

### Password Security
- Hashed using bcryptjs (salt rounds: 10)
- Never stored in plain text
- Minimum 6 characters required

### Email Verification
- OTP sent via SendGrid
- 10-minute expiration for OTP codes
- User must verify email during registration

---

## 📤 Deployment

### Frontend Deployment (Vercel)

1. **Build the application:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel deploy --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - `VITE_API_URL`: Your backend API URL

**Current Frontend URL**: https://task-manager-frontend.vercel.app

### Backend Deployment (Render)

1. **Create a Render account** and connect your GitHub repo

2. **Create a new Web Service:**
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set environment variables:**
   ```
   MONGODB_URI=<your_mongodb_url>
   JWT_SECRET=<your_jwt_secret>
   SENDGRID_API_KEY=<your_sendgrid_key>
   FRONTEND_URL=<your_frontend_url>
   NODE_ENV=production
   ```

4. **Deploy** - Render automatically deploys on push to main branch

**Current Backend URL**: https://task-manager-x6vw.onrender.com

### Docker Deployment (Optional)

**Backend Dockerfile:**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem**: "VITE_API_URL is undefined"
**Solution**: 
```bash
# Create .env file in frontend/ with:
VITE_API_URL=http://localhost:5000/api
```

**Problem**: "Module not found: react-icons"
**Solution**: 
```bash
cd frontend
npm install react-icons
```

**Problem**: CORS errors in network requests
**Solution**: 
- Ensure backend CORS includes your frontend URL
- Check `.env` FRONTEND_URL in backend

### Backend Issues

**Problem**: "Cannot connect to MongoDB"
**Solution**:
```bash
# Check MONGODB_URI in .env
# Verify network access in MongoDB Atlas
# Test connection: node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected!'))"
```

**Problem**: "Cast to ObjectId failed"
**Solution**: Ensure all IDs are valid MongoDB ObjectIds (24 hex characters)

**Problem**: "SendGrid API key invalid"
**Solution**: Verify the API key in your SendGrid dashboard and `.env`

### Port Already in Use

**Kill process on port:**
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9
lsof -ti:5174 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 🤝 Contributing

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Task-Manager.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Code Standards
- Follow existing code style
- Write meaningful commit messages
- Test before pushing
- Update documentation if needed

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions:
- **GitHub Issues**: [Create an issue](https://github.com/Sanchitjha/Task-Manager/issues)
- **Email**: sanchitjha@example.com

---

## 🙏 Acknowledgments

- Built with **React**, **Node.js**, and **MongoDB**
- UI designed with **Tailwind CSS**
- Icons from **React Icons** & **Font Awesome**
- Data visualization with **Recharts**
- Email service by **SendGrid**

---

## 📊 Project Statistics

- **Frontend**: 40+ React components
- **Backend**: 8+ API route modules
- **Database**: 8 MongoDB collections
- **API Endpoints**: 100+ endpoints
- **Lines of Code**: 15,000+
- **Build Time**: ~5-7 seconds
- **Bundle Size**: ~1MB (gzipped)

---

**Last Updated**: February 2026  
**Current Version**: 1.0.0  
**Status**: ✅ Production Ready
