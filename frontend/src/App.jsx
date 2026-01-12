import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import Home from './pages/Home';
import Login from './pages/Login';
import Earn from './pages/Earn';
import Wallet from './pages/Wallet';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import AdminVideos from './pages/AdminVideos';
import AdminDashboard from './pages/AdminDashboard';
import AdminVendors from './pages/AdminVendors';
import SubAdminDashboard from './pages/SubAdminDashboard';
import Profile from './pages/Profile';
import Products from './pages/Products';
import ProductCreate from './pages/ProductCreate';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import VendorDashboard from './pages/VendorDashboard';
import SellerDashboard from './pages/SellerDashboard';
import SellerInventory from './pages/SellerInventory';
import SellerOrders from './pages/SellerOrders';
import SellerReviews from './pages/SellerReviews';
import SellerProfile from './pages/SellerProfile';
import SellerAnalytics from './pages/SellerAnalytics';
import SellerWallet from './pages/SellerWallet';
import ProductEdit from './pages/ProductEdit';

function App() {
	return (
		<AuthProvider>
			<NotificationProvider>
				<Router>
					<OfflineIndicator />
					<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
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
					<Route path="/vendor/dashboard" element={
						<ProtectedRoute>
							<VendorDashboard />
						</ProtectedRoute>
					} />
					<Route path="/vendor/products/new" element={<ProductCreate />} />

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
					<Route path="/vendor/products/:id/edit" element={
						<ProtectedRoute>
							<ProductEdit />
						</ProtectedRoute>
					} />
					
					{/* Protected Routes */}
					<Route path="/earn" element={
						<ProtectedRoute clientOnly>
							<Earn />
						</ProtectedRoute>
					} />
					<Route path="/wallet" element={
						<ProtectedRoute clientOnly>
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
					<Route path="/admin/vendors" element={
						<ProtectedRoute adminOnly>
							<AdminVendors />
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