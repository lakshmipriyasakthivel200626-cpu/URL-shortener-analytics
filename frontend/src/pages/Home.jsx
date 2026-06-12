import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, BarChart3, QrCode, Shield, ArrowRight } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#0b0f19] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accentBlue/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-accentIndigo/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto z-10 py-16">
        <div className="inline-flex items-center space-x-2 bg-slate-800/60 border border-white/5 px-4 py-1.5 rounded-full mb-8">
          <span className="flex h-2 w-2 rounded-full bg-accentCyan animate-pulse"></span>
          <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Hackathon Portfolio Project</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Shorten Your Links. <br />
          <span className="gradient-text">Analyze Your Traffic.</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Create trackable, short links instantly. Monitor clicks, analyze device types, browser clients, and daily visitor trends in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 gradient-primary text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-accentBlue/25 hover:shadow-accentBlue/35 transition-smooth hover:scale-[1.02]"
          >
            <span>{user ? "Go to Dashboard" : "Start For Free"}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          {!user && (
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-white/5 hover:border-white/10 font-semibold px-8 py-4 rounded-xl transition-smooth"
            >
              <span>Login to Account</span>
            </Link>
          )}
        </div>

        {/* Feature section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-20 text-left">
          <div className="glass-card p-6 rounded-2xl border border-white/5 glass-card-hover">
            <div className="gradient-primary/10 p-3 rounded-xl w-fit text-accentBlue mb-4">
              <Link2 className="h-6 w-6" />
            </div>
            <h3 className="text-slate-200 font-bold text-lg mb-2">Instant Shortening</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Convert long, clunky URLs into short, memorable links in just one click.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 glass-card-hover">
            <div className="gradient-primary/10 p-3 rounded-xl w-fit text-accentCyan mb-4">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-slate-200 font-bold text-lg mb-2">Deep Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track browsers, operating systems, device types, and daily click trends.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 glass-card-hover">
            <div className="gradient-primary/10 p-3 rounded-xl w-fit text-accentIndigo mb-4">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="text-slate-200 font-bold text-lg mb-2">QR Code Gen</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate fully functional QR codes dynamically for print and mobile distribution.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 glass-card-hover">
            <div className="gradient-primary/10 p-3 rounded-xl w-fit text-emerald-400 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-slate-200 font-bold text-lg mb-2">Protected & Secure</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Equipped with JWT authorization, hashing, and safe link management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
