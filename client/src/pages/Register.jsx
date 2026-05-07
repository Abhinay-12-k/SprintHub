import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineArrowRight, HiOutlineShieldCheck } from 'react-icons/hi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
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
        <p className="text-[10px] font-black text-[#C5A358] uppercase tracking-[0.4em] mb-3">Onboarding System</p>
        <h2 className="text-4xl font-black text-[#0F4335] serif-font italic">Join the Mission</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">
            Full Identity
          </label>
          <div className="relative group">
            <HiOutlineUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F4335] transition-colors w-5 h-5" />
            <input
              name="name"
              type="text"
              required
              className="w-full pl-14 pr-6 py-4 bg-[#F9F7F2] border-none rounded-full text-sm focus:ring-4 focus:ring-[#0F4335]/5 transition-all"
              placeholder="e.g. Abhinay Kuruba"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">
            Email Address
          </label>
          <div className="relative group">
            <HiOutlineMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F4335] transition-colors w-5 h-5" />
            <input
              name="email"
              type="email"
              required
              className="w-full pl-14 pr-6 py-4 bg-[#F9F7F2] border-none rounded-full text-sm focus:ring-4 focus:ring-[#0F4335]/5 transition-all"
              placeholder="e.g. kuruba@sprinthub.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">
            Create Password
          </label>
          <div className="relative group">
            <HiOutlineLockClosed className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F4335] transition-colors w-5 h-5" />
            <input
              name="password"
              type="password"
              required
              className="w-full pl-14 pr-6 py-4 bg-[#F9F7F2] border-none rounded-full text-sm focus:ring-4 focus:ring-[#0F4335]/5 transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">
            Security Role
          </label>
          <div className="relative group">
            <HiOutlineShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0F4335] transition-colors w-5 h-5" />
            <select
              name="role"
              className="w-full pl-14 pr-6 py-4 bg-[#F9F7F2] border-none rounded-full text-sm focus:ring-4 focus:ring-[#0F4335]/5 transition-all appearance-none"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="member">Team Member</option>
              <option value="admin">Project Administrator</option>
            </select>
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
              Initialize Account
              <HiOutlineArrowRight className="w-5 h-5 text-[#C5A358]" />
            </div>
          )}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-slate-50">
        <p className="text-center text-xs font-bold text-slate-400 serif-font italic">
          Already a strategist?{' '}
          <Link to="/login" className="text-[#C5A358] hover:text-[#0F4335] transition-colors underline underline-offset-4">
            Authorized Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
