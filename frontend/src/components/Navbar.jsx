import LogoutButton from './LogoutButton';
import { authService } from '../utils/auth';

const Navbar = () => {
  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        
        {isAuthenticated && (
          <div className="flex gap-4 items-center">
            <span>Welcome, {user?.name}</span>
            <span className="text-sm text-gray-400">({user?.role})</span>
            <LogoutButton />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;