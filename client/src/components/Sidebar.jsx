import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineFolder, 
  HiOutlineClipboardList, 
  HiOutlineViewBoards,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineLogout
} from 'react-icons/hi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HiOutlineViewGrid },
    { name: 'Projects', href: '/projects', icon: HiOutlineFolder },
    { name: 'Tasks', href: '/tasks', icon: HiOutlineClipboardList },
    { name: 'Kanban', href: '/kanban', icon: HiOutlineViewBoards },
  ];

  const adminNav = [
    { name: 'Team Members', href: '/users', icon: HiOutlineUsers },
  ];

  const secondaryNav = [
    { name: 'Settings', href: '/settings', icon: HiOutlineCog },
  ];

  const NavItem = ({ item }) => (
    <NavLink to={item.href} onClick={() => window.innerWidth < 1024 && toggleSidebar()}>
      {({ isActive }) => (
        <div className={`
          flex items-center gap-4 px-6 py-4 text-[13px] font-bold rounded-2xl transition-all duration-300 relative group
          ${isActive 
            ? 'bg-[#C5A358] text-[#0F4335] shadow-lg shadow-black/20 scale-[1.02]' 
            : 'text-white/60 hover:bg-white/5 hover:text-white'}
        `}>
          <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#0F4335]' : 'text-[#C5A358] group-hover:text-[#C5A358]'}`} />
          <span className="serif-font italic">{item.name}</span>
        </div>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0F4335] text-white
        transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex items-center gap-4 px-8 h-24 border-b border-white/5">
            <div className="w-10 h-10 bg-[#C5A358] rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
              <span className="text-[#0F4335] font-black text-xl serif-font">S</span>
            </div>
            <span className="text-2xl font-bold tracking-tight serif-font italic">SprintHub</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-10 px-6 space-y-12 scrollbar-hide">
            <div>
              <p className="px-4 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">
                Navigation
              </p>
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </nav>
            </div>

            {isAdmin() && (
              <div>
                <p className="px-4 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">
                  Management
                </p>
                <nav className="space-y-2">
                  {adminNav.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                </nav>
              </div>
            )}
          </div>

          {/* User Section */}
          <div className="p-8 bg-black/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#C5A358] flex items-center justify-center text-[#0F4335] font-black border-4 border-white/10">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate serif-font italic">
                  {user?.name}
                </p>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest truncate">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-3 w-full px-6 py-4 text-xs font-bold text-white hover:bg-white/5 rounded-2xl transition-all duration-300 border border-white/10"
            >
              <HiOutlineLogout className="w-4 h-4 text-[#C5A358]" />
              Sign Out Account
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
