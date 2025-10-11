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

function App() {
	return (
		<AuthProvider>
			<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					
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
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;