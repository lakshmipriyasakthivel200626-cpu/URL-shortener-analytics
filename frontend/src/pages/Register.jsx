import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, User, Mail, Lock, AlertCircle } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#0b0f19] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accentIndigo/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-white/5 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="gradient-primary p-3 rounded-2xl text-white mb-3 shadow-md">
            <Link2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Create Account</h2>
          <p className="text-slate-400 text-sm mt-1">Get started with trackable short links</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl flex items-start space-x-2 text-sm mb-6">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="h-5 w-5" />
              </div>
              <input
                id="username"
                type="text"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue transition-smooth text-sm"
                placeholder="Coder123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue transition-smooth text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue transition-smooth text-sm"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-primary text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-accentBlue/25 hover:scale-[1.01] transition-smooth disabled:opacity-50 disabled:scale-100 flex items-center justify-center cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-accentBlue hover:underline font-medium">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
