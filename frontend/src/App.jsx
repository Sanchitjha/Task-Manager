import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const SecurityPolicy = lazy(() => import('./pages/SecurityPolicy'));
const Contact = lazy(() => import('./pages/Contact'));
const Earn = lazy(() => import('./pages/Earn'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Shop = lazy(() => import('./pages/Shop'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminVideos = lazy(() => import('./pages/AdminVideos'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminPartners = lazy(() => import('./pages/AdminPartners'));
const SubAdminDashboard = lazy(() => import('./pages/SubAdminDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Products = lazy(() => import('./pages/Products'));
const ProductCreate = lazy(() => import('./pages/ProductCreate'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'));
const VendorShop = lazy(() => import('./pages/VendorShop'));
const VendorShopsList = lazy(() => import('./pages/VendorShopsList'));
const VendorShopSetup = lazy(() => import('./components/VendorShopSetup'));
const PartnerRegister = lazy(() => import('./pages/PartnerRegister'));
const ProductForm = lazy(() => import('./pages/ProductForm'));
const ProductManagement = lazy(() => import('./pages/ProductManagement'));
const PurchaseConfirmation = lazy(() => import('./pages/PurchaseConfirmation'));
const PublicStorePage = lazy(() => import('./pages/PublicStorePage'));
const PartnerReports = lazy(() => import('./pages/PartnerReports'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const SellerInventory = lazy(() => import('./pages/SellerInventory'));
const SellerOrders = lazy(() => import('./pages/SellerOrders'));
const SellerReviews = lazy(() => import('./pages/SellerReviews'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));
const SellerAnalytics = lazy(() => import('./pages/SellerAnalytics'));
const SellerWallet = lazy(() => import('./pages/SellerWallet'));
const ProductEdit = lazy(() => import('./pages/ProductEdit'));
const ProductSubscriptionPayment = lazy(() => import('./pages/ProductSubscriptionPayment'));
const AdminSubscriptions = lazy(() => import('./pages/AdminSubscriptions'));
const VendorSubscriptions = lazy(() => import('./pages/VendorSubscriptions'));

// Loading fallback component
const PageLoader = () => (
	<div className="min-h-screen flex items-center justify-center">
		<LoadingSpinner size="large" />
	</div>
);

function App() {
	return (
		<AuthProvider>
			<NotificationProvider>
				<Router>
					<OfflineIndicator />
					<Navbar />
					<Suspense fallback={<PageLoader />}>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={
						<ErrorBoundary>
							<Login />
						</ErrorBoundary>
					} />
					<Route path="/register" element={
						<ErrorBoundary>
							<Register />
						</ErrorBoundary>
					} />
					<Route path="/forgot-password" element={
						<ErrorBoundary>
							<ForgotPassword />
						</ErrorBoundary>
					} />
					<Route path="/privacy" element={<PrivacyPolicy />} />
					<Route path="/terms" element={<TermsConditions />} />
					<Route path="/security" element={<SecurityPolicy />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/partner/register" element={
						<ErrorBoundary>
							<PartnerRegister />
						</ErrorBoundary>
					} />
					<Route path="/products" element={<Products />} />
					<Route path="/product/:id" element={<ProductDetail />} />
					<Route path="/cart" element={
						<ProtectedRoute>
							<Cart />
						</ProtectedRoute>
					} />
					<Route path="/checkout" element={
						<ProtectedRoute>
							<Checkout />
						</ProtectedRoute>
					} />
					<Route path="/orders" element={
						<ProtectedRoute>
							<Orders />
						</ProtectedRoute>
					} />
<Route path="/partner/dashboard" element={
	<ProtectedRoute>
		<PartnerDashboard />
	</ProtectedRoute>
} />
<Route path="/products" element={
	<ProtectedRoute>
		<ProductManagement />
	</ProtectedRoute>
} />
<Route path="/products/create" element={
	<ProtectedRoute>
		<ProductForm />
	</ProtectedRoute>
} />
<Route path="/products/edit/:id" element={
	<ProtectedRoute>
		<ProductForm />
	</ProtectedRoute>
} />
<Route path="/partner/purchase-confirm" element={
	<ProtectedRoute>
		<PurchaseConfirmation />
	</ProtectedRoute>
} />
<Route path="/partner/reports" element={
	<ProtectedRoute>
		<PartnerReports />
	</ProtectedRoute>
} />
<Route path="/store/:partnerId" element={<PublicStorePage />} />
<Route path="/shops" element={<VendorShopsList />} />
<Route path="/partner/setup-shop" element={
	<ProtectedRoute>
		<VendorShopSetup />
	</ProtectedRoute>
} />
<Route path="/partner/products/new" element={<ProductCreate />} />
<Route path="/shop/:partnerId" element={<VendorShop />} />

					{/* Seller Portal Routes */}
					<Route path="/seller" element={
						<ProtectedRoute>
							<SellerDashboard />
						</ProtectedRoute>
					} />
					<Route path="/seller/dashboard" element={
						<ProtectedRoute>
							<SellerDashboard />
						</ProtectedRoute>
					} />
					<Route path="/seller/inventory" element={
						<ProtectedRoute>
							<SellerInventory />
						</ProtectedRoute>
					} />
					<Route path="/seller/products/new" element={
						<ProtectedRoute>
							<ProductCreate />
						</ProtectedRoute>
					} />
					<Route path="/seller/orders" element={
						<ProtectedRoute>
							<SellerOrders />
						</ProtectedRoute>
					} />
					<Route path="/seller/reviews" element={
						<ProtectedRoute>
							<SellerReviews />
						</ProtectedRoute>
					} />
					<Route path="/seller/profile" element={
						<ProtectedRoute>
							<SellerProfile />
						</ProtectedRoute>
					} />
					<Route path="/seller/subscriptions" element={
						<ProtectedRoute>
							<VendorSubscriptions />
						</ProtectedRoute>
					} />
					<Route path="/seller/analytics" element={
						<ProtectedRoute>
							<SellerAnalytics />
						</ProtectedRoute>
					} />
					<Route path="/seller/wallet" element={
						<ProtectedRoute>
							<SellerWallet />
						</ProtectedRoute>
					} />
					<Route path="/seller/products/:id/edit" element={
						<ProtectedRoute>
							<ProductEdit />
						</ProtectedRoute>
					} />
					<Route path="/partner/products/:id/edit" element={
						<ProtectedRoute>
							<ProductEdit />
						</ProtectedRoute>
					} />
					<Route path="/subscription/payment/:productId" element={
						<ProtectedRoute>
							<ProductSubscriptionPayment />
						</ProtectedRoute>
					} />
					<Route path="/admin/subscriptions" element={
						<ProtectedRoute adminOnly>
							<AdminSubscriptions />
						</ProtectedRoute>
					} />
					
					{/* Protected Routes */}
					<Route path="/earn" element={
						<ProtectedRoute userOnly>
							<Earn />
						</ProtectedRoute>
					} />
					<Route path="/wallet" element={
						<ProtectedRoute>
							<Wallet />
						</ProtectedRoute>
					} />
					<Route path="/shop" element={
						<ProtectedRoute>
							<Shop />
						</ProtectedRoute>
					} />
					<Route path="/admin" element={
						<ProtectedRoute adminOnly>
							<Admin />
						</ProtectedRoute>
					} />
					<Route path="/admin/videos" element={
						<ProtectedRoute adminOnly>
							<AdminVideos />
						</ProtectedRoute>
					} />
					<Route path="/admin/partners" element={
						<ProtectedRoute adminOnly>
							<AdminPartners />
						</ProtectedRoute>
					} />
					<Route path="/admin/dashboard" element={
						<ProtectedRoute adminOnly>
							<AdminDashboard />
						</ProtectedRoute>
					} />
					<Route path="/subadmin/dashboard" element={
						<ProtectedRoute>
							<SubAdminDashboard />
						</ProtectedRoute>
					} />
					<Route path="/profile" element={
						<ProtectedRoute>
							<Profile />
						</ProtectedRoute>
					} />
				</Routes>
					</Suspense>
					<InstallPrompt />
				</Router>
			</NotificationProvider>
		</AuthProvider>
	);
}

export default App;