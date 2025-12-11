import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Earn from './pages/Earn';
import Wallet from './pages/Wallet';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import AdminVideos from './pages/AdminVideos';
import AdminDashboard from './pages/AdminDashboard';
import SubAdminDashboard from './pages/SubAdminDashboard';
import Profile from './pages/Profile';
import Products from './pages/Products';
import ProductCreate from './pages/ProductCreate';
import VendorDashboard from './pages/VendorDashboard';
import SellerDashboard from './pages/SellerDashboard';
import SellerInventory from './pages/SellerInventory';
import SellerOrders from './pages/SellerOrders';
import SellerReviews from './pages/SellerReviews';
import SellerProfile from './pages/SellerProfile';

function App() {
	return (
		<AuthProvider>
			<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/products" element={<Products />} />
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
					<Route path="/seller/wallet" element={
						<ProtectedRoute>
							<Wallet />
						</ProtectedRoute>
					} />
					
					{/* Protected Routes */}
					<Route path="/earn" element={
						<ProtectedRoute>
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
			</Router>
		</AuthProvider>
	);
}

export default App;