import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0f19] text-slate-200">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accentBlue border-t-transparent"></div>
        <span className="ml-3 text-lg font-medium">Loading session...</span>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
