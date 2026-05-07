import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowRight } from 'react-icons/hi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10 text-center">
        <p className="text-[10px] font-black text-[#C5A358] uppercase tracking-[0.4em] mb-3">Security Access</p>
        <h2 className="text-4xl font-black text-[#0F4335] serif-font italic">Welcome Back</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">
            Email Address
          </label>
          <div className="relative group">
            <HiOutlineMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F4335] transition-colors w-5 h-5" />
            <input
              type="email"
              required
              className="w-full pl-14 pr-6 py-4 bg-[#F9F7F2] border-none rounded-full text-sm focus:ring-4 focus:ring-[#0F4335]/5 transition-all"
              placeholder="e.g. kuruba@sprinthub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">
            Security Password
          </label>
          <div className="relative group">
            <HiOutlineLockClosed className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F4335] transition-colors w-5 h-5" />
            <input
              type="password"
              required
              className="w-full pl-14 pr-6 py-4 bg-[#F9F7F2] border-none rounded-full text-sm focus:ring-4 focus:ring-[#0F4335]/5 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-5 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0F4335]/10 mt-4"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              Authorize Access
              <HiOutlineArrowRight className="w-5 h-5 text-[#C5A358]" />
            </div>
          )}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-slate-50">
        <p className="text-center text-xs font-bold text-slate-400 serif-font italic">
          New to the hub?{' '}
          <Link to="/register" className="text-[#C5A358] hover:text-[#0F4335] transition-colors underline underline-offset-4">
            Initialize Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
