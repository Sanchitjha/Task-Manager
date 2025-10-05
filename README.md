# The MANAGER - Rewards Platform

A modern web-based rewards platform built with React, Node.js, Express, and MongoDB. Users can earn coins by watching videos, track their wallet balance, and redeem coins for discounts.

## Features

- **User Management**: Multiple roles (Admin, Sub-admin, Client, Vendor) with transfer permissions
- **Video Rewards**: Watch YouTube videos and earn coins based on watch time
- **Wallet System**: Track balance, transactions, and coin transfers
- **Shop & Redeem**: Use coins for discounts on external purchases
- **Admin Panel**: Manage users, videos, settings, and permissions

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT tokens
- **Styling**: TailwindCSS with Databox-inspired theme

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)

### One-Command Setup

1. Install all dependencies:
```bash
npm run install:all
```

2. Create backend environment file:
```bash
cd backend
cp .env.example .env
```

3. Update `backend/.env` with your MongoDB URI and JWT secret:
```
MONGODB_URI=mongodb://127.0.0.1:27017/manager
JWT_SECRET=your_secret_key_here
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

4. Start both frontend and backend:
```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Individual Commands

- **Backend only**: `npm run dev:backend`
- **Frontend only**: `npm run dev:frontend`
- **Build frontend**: `npm run build`
- **Start production**: `npm start`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Videos
- `GET /api/videos` - Get active videos
- `POST /api/videos` - Add video (Admin only)

### Wallet
- `GET /api/wallet/balance` - Get user balance
- `GET /api/wallet/transactions` - Get transaction history

### Users
- `GET /api/users` - List all users

### Settings
- `GET /api/settings` - Get app settings
- `POST /api/settings` - Update settings

## Project Structure

```
├── server/                 # Backend API
│   ├── src/
│   │   ├── lib/           # Database connection
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/        # API routes
│   │   ├── schemas/       # Mongoose models
│   │   └── index.js       # Server entry
│   └── package.json
├── client/                # Frontend React app
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app with routing
│   │   └── main.jsx       # Entry point
│   └── package.json
└── README.md
```

## Development

- Backend runs on http://localhost:5000
- Frontend runs on http://localhost:5173
- MongoDB should be running on default port 27017

## License

MIT License

