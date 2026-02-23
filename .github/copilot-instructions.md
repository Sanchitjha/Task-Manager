# Copilot instructions

## Project overview
- Monorepo with Node/Express API in `backend/` and React + Vite client in `frontend/`.
- API entrypoint is `backend/src/index.js`, which wires routes under `/api/*`, serves `/uploads`, and starts subscription cron jobs in `backend/src/lib/subscriptionCron.js`.
- Data access is via Mongoose models in `backend/src/schemas/` (User, Product, Order, WalletTransaction, etc.).
- Frontend routing is centralized in `frontend/src/App.jsx` and guarded by `ProtectedRoute` with role checks.

## Core patterns to follow
- Auth is JWT-based with optional cookie fallback: see `backend/src/middleware/auth.js` and `frontend/src/lib/api.js` (adds `Authorization: Bearer` and `withCredentials: true`).
- Roles are meaningful in both backend and UI: `admin`, `subadmin`, `user`, and `Partner`/`partner` appear in logic (see `frontend/src/components/Navbar.jsx` and auth routes). Be careful to match existing casing in the area you touch.
- Use the shared Axios client in `frontend/src/lib/api.js` for API calls; it centralizes base URL, auth headers, and 401 handling.
- File uploads use multer disk storage: profile images in `backend/src/middleware/upload.js`, product images in `backend/src/middleware/uploadProduct.js`. Assets are served from `/uploads`.
- Email OTP flows are implemented in `backend/src/lib/emailOtpService.js` and `backend/src/routes/auth.js` for registration (`/send-email-otp`, `/verify-email-otp-register`) and password reset (`/forgot-password`, `/reset-password`). OTP fields in User schema: `emailOtpCode`, `resetPasswordOtp`.

## Developer workflows
- Install all dependencies: `npm run install:all` (root).
- Run both services: `npm run dev` (root) or individually: `npm run dev` in `backend/` and `frontend/`.
- Frontend build: `npm run build` in `frontend/`.

## Configuration & integration points
- Backend env vars: `MONGODB_URI`, `MONGO_DB`, `JWT_SECRET`, `SENDGRID_API_KEY`, `FROM_EMAIL`, `PORT`.
- Frontend env var: `VITE_API_URL` (defaults to the Render API URL in `frontend/src/lib/api.js`).
- CORS allowlist is hardcoded in `backend/src/index.js`; update it if adding new client origins.
- PWA/service worker logic lives in `frontend/src/main.jsx` and `frontend/public/sw.js`.

## What to check when changing behavior
- API routes live in `backend/src/routes/` and typically use `auth`/`adminOnly` middleware from `backend/src/middleware/auth.js`.
- UI navigation and access control live in `frontend/src/App.jsx` and `frontend/src/components/Navbar.jsx`.
- If adding new API modules, add route registration in `backend/src/index.js` and the client in `frontend/src/lib/api.js`.
