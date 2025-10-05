import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/earn" element={<Earn />} />
					<Route path="/wallet" element={<Wallet />} />
					<Route path="/shop" element={<Shop />} />
					<Route path="/admin" element={<Admin />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
