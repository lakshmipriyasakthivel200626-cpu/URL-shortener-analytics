import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2 text-2xl font-bold tracking-tight">
        <div className="gradient-primary p-2 rounded-lg text-white">
          <Link2 className="h-6 w-6" />
        </div>
        <span className="gradient-text">Shortnify</span>
      </Link>

      <div className="flex items-center space-x-6">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-smooth text-sm font-medium"
            >
              <LayoutDashboard className="h-4.5 w-4.5 text-accentCyan" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-2 border-l border-white/10 pl-6">
              <div className="bg-slate-800 p-1.5 rounded-full">
                <User className="h-4.5 w-4.5 text-accentBlue" />
              </div>
              <span className="text-slate-300 text-sm font-medium">{user.username}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition-smooth text-sm font-semibold border border-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-slate-300 hover:text-white text-sm font-medium transition-smooth"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="gradient-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-accentBlue/20 transition-smooth"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
