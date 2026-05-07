import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineBell, HiOutlineShieldCheck, HiOutlineCog } from 'react-icons/hi';
import toast from 'react-hot-toast';
import userService from '../services/userService';

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await userService.updateProfile({ name });
      toast.success('Strategy updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Configuration</p>
          <h1 className="text-5xl font-black serif-font italic">
            Command <span className="text-[#C5A358]">Control</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-10">
          <div className="card !p-10 relative overflow-hidden group">
            <div className="flex items-center gap-6 mb-12">
               <div className="w-16 h-16 rounded-[2rem] bg-[#F9F7F2] flex items-center justify-center text-[#0F4335] shadow-inner">
                  <HiOutlineUser className="w-8 h-8" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-[#0F4335] serif-font italic">Personal Identity</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage your public information</p>
               </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full pl-8 pr-6 py-4 bg-[#F9F7F2] border-none rounded-full text-sm focus:ring-4 focus:ring-[#0F4335]/5 transition-all font-bold" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Authorized Email</label>
                  <input 
                    type="email" 
                    className="w-full pl-8 pr-6 py-4 bg-[#F9F7F2] border-none rounded-full text-sm opacity-60 font-bold" 
                    value={user?.email} 
                    disabled 
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={updating}
                  className="btn-primary px-10 py-4 text-xs font-black uppercase tracking-[0.2em]"
                >
                  {updating ? 'SYCHRONIZING...' : 'UPDATE IDENTITY'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Card */}
          <div className="card !p-10">
            <div className="flex items-center gap-6 mb-12">
               <div className="w-16 h-16 rounded-[2rem] bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                  <HiOutlineShieldCheck className="w-8 h-8" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-[#0F4335] serif-font italic">Security Protocols</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage encryption and access</p>
               </div>
            </div>
            
            <div className="space-y-6">
              <button className="btn-secondary w-full md:w-auto px-10 py-4 text-xs font-black uppercase tracking-[0.2em] border-rose-100 hover:bg-rose-50">
                INITIATE PASSWORD RESET
              </button>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2">Last synchronized: 12 days ago</p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="card !p-8 bg-[#0F4335] text-white">
             <HiOutlineCog className="w-12 h-12 text-[#C5A358] mb-6 animate-spin-slow" />
             <h3 className="text-xl font-bold serif-font italic mb-4 text-[#C5A358]">System Status</h3>
             <p className="text-sm text-white/60 leading-relaxed mb-6 italic">
               SprintHub is running on the latest strategic framework. All nodes are active.
             </p>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Stable Connection</span>
             </div>
          </div>

          <div className="card !p-8 border-dashed border-2 border-slate-200 shadow-none hover:border-[#C5A358] transition-colors cursor-help group">
             <HiOutlineBell className="w-8 h-8 text-[#C5A358] mb-4 group-hover:animate-bounce" />
             <h4 className="text-sm font-bold text-[#0F4335] uppercase tracking-widest mb-2">Notification Preferences</h4>
             <p className="text-xs text-slate-400 italic serif-font">Configure how you receive strategic updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
