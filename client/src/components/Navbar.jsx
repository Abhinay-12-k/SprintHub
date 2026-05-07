import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineSun, 
  HiOutlineMoon, 
  HiOutlineMenuAlt2, 
  HiOutlineBell, 
  HiOutlineSearch,
  HiOutlineCube
} from 'react-icons/hi';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <nav className="h-24 bg-white/40 backdrop-blur-md sticky top-0 z-30 flex items-center px-12">
      <div className="flex-1 flex items-center gap-8">
        <button 
          onClick={toggleSidebar}
          className="p-3.5 rounded-2xl bg-white text-[#0F4335] lg:hidden hover:bg-[#0F4335]/5 transition-all active:scale-95 shadow-sm"
        >
          <HiOutlineMenuAlt2 className="w-6 h-6" />
        </button>
        
        <div className="hidden md:flex items-center bg-white border-none rounded-full px-8 py-3.5 w-72 lg:w-[450px] group focus-within:ring-4 focus-within:ring-[#0F4335]/5 transition-all shadow-sm">
          <HiOutlineSearch className="text-slate-400 w-5 h-5 group-focus-within:text-[#0F4335] transition-colors" />
          <input 
            type="text" 
            placeholder="Search team activity..." 
            className="bg-transparent border-none focus:ring-0 text-sm ml-4 w-full text-slate-700 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="p-3.5 rounded-2xl bg-white text-[#0F4335] relative hover:bg-[#0F4335]/5 transition-all active:scale-95 shadow-sm">
          <HiOutlineBell className="w-6 h-6" />
          <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-[#C5A358] rounded-full border-2 border-white animate-pulse"></span>
        </button>

        <div className="h-10 w-px bg-slate-200 mx-4 hidden sm:block"></div>

        {/* User Profile */}
        <div className="flex items-center gap-5 cursor-pointer group">
          <div className="hidden sm:block text-right">
            <p className="text-base font-bold text-[#0F4335] leading-none serif-font italic">
              {user?.name}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 leading-none">
              {user?.role} Account
            </p>
          </div>
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-[#C5A358] flex items-center justify-center text-[#0F4335] font-black border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
