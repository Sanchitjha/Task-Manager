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

function App() {
	return (
		<AuthProvider>
			<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/products" element={<Products />} />
					<Route path="/vendor/products/new" element={<ProductCreate />} />
					
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