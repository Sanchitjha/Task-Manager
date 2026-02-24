import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import SecurityPolicy from './pages/SecurityPolicy';
import Contact from './pages/Contact';
import Earn from './pages/Earn';
import Wallet from './pages/Wallet';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import AdminVideos from './pages/AdminVideos';
import AdminDashboard from './pages/AdminDashboard';
import AdminPartners from './pages/AdminPartners';
import SubAdminDashboard from './pages/SubAdminDashboard';
import Profile from './pages/Profile';
import Products from './pages/Products';
import ProductCreate from './pages/ProductCreate';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import VendorDashboard from './pages/VendorDashboard'; // PartnerDashboard
import PartnerDashboard from './pages/PartnerDashboard';
import VendorShop from './pages/VendorShop'; // PartnerShop
import VendorShopsList from './pages/VendorShopsList'; // PartnerShopsList
import VendorShopSetup from './components/VendorShopSetup'; // PartnerShopSetup
import PartnerRegister from './pages/PartnerRegister';
import ProductForm from './pages/ProductForm';
import ProductManagement from './pages/ProductManagement';
import PurchaseConfirmation from './pages/PurchaseConfirmation';
import PublicStorePage from './pages/PublicStorePage';
import PartnerReports from './pages/PartnerReports';
import SellerDashboard from './pages/SellerDashboard';
import SellerInventory from './pages/SellerInventory';
import SellerOrders from './pages/SellerOrders';
import SellerReviews from './pages/SellerReviews';
import SellerProfile from './pages/SellerProfile';
import SellerAnalytics from './pages/SellerAnalytics';
import SellerWallet from './pages/SellerWallet';
import ProductEdit from './pages/ProductEdit';
import ProductSubscriptionPayment from './pages/ProductSubscriptionPayment';
import AdminSubscriptions from './pages/AdminSubscriptions';
import VendorSubscriptions from './pages/VendorSubscriptions';

function App() {
	return (
		<AuthProvider>
			<NotificationProvider>
				<Router>
					<OfflineIndicator />
					<Navbar />
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
					<InstallPrompt />
				</Router>
			</NotificationProvider>
		</AuthProvider>
	);
}

export default App;