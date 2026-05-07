import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import { 
  HiOutlineUsers, 
  HiOutlineMail, 
  HiOutlineShieldCheck, 
  HiOutlineTrash, 
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlineDotsHorizontal
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      const usersData = response.data.data?.users || response.data.users || response.data.data || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await userService.deactivate(id);
      toast.success('Member removed successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Human Resources</p>
          <h1 className="text-5xl font-black serif-font italic">
            Volunteer <span className="text-[#C5A358]">HQ</span>
          </h1>
        </div>
        <button className="btn-secondary px-8 flex items-center gap-3">
          <HiOutlineDownload className="w-5 h-5 text-[#C5A358]" />
          EXPORT CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card !p-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex-1 max-w-md relative group">
          <HiOutlineSearch className="absolute left-6 w-5 h-5 text-slate-300 group-focus-within:text-[#0F4335] transition-colors" />
          <input 
            type="text" 
            placeholder="Search applications..." 
            className="w-full pl-14 pr-6 py-4 bg-[#F9F7F2] border-none rounded-full text-sm focus:ring-2 focus:ring-[#0F4335]/5 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center bg-[#F9F7F2] p-1.5 rounded-full shadow-inner overflow-x-auto no-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-3 rounded-full text-[10px] font-black tracking-widest transition-all ${
                activeFilter === filter 
                ? 'bg-white text-[#0F4335] shadow-md scale-105' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="card !p-0 overflow-hidden bg-transparent shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <th className="px-10 pb-2">Candidate</th>
                <th className="px-10 pb-2">Location</th>
                <th className="px-10 pb-2">Availability</th>
                <th className="px-10 pb-2">Status</th>
                <th className="px-10 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="h-24 bg-white rounded-[2rem] shadow-sm animate-pulse">
                    <td colSpan="5" className="rounded-[2rem]"></td>
                  </tr>
                ))
              ) : users.map((user) => (
                <tr key={user._id} className="group bg-white rounded-[2rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  <td className="px-10 py-6 first:rounded-l-[2rem]">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#F9F7F2] flex items-center justify-center text-[#0F4335] font-black serif-font text-xl shadow-inner group-hover:bg-[#C5A358] group-hover:text-white transition-colors">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#0F4335] serif-font italic">{user.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#C5A358] rounded-full"></div>
                      <span className="text-sm font-bold text-slate-600 serif-font italic">India</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <HiOutlineShieldCheck className="w-5 h-5 text-[#C5A358]" />
                      <span className="text-sm font-bold serif-font italic">Weekends</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      APPROVED
                    </span>
                  </td>
                  <td className="px-10 py-6 last:rounded-r-[2rem] text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-3 bg-[#F9F7F2] text-slate-400 hover:text-[#0F4335] hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all">
                        <HiOutlinePlus className="w-5 h-5" />
                      </button>
                      <button className="p-3 bg-[#F9F7F2] text-slate-400 hover:text-[#0F4335] hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all">
                        <HiOutlineDotsHorizontal className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeactivate(user._id)}
                        className="p-3 bg-red-50 text-red-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
