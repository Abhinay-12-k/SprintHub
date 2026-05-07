import React from 'react';

const StatCard = ({ title, value, icon: Icon, loading }) => {
  if (loading) {
    return (
      <div className="card h-40 skeleton rounded-[2.5rem]"></div>
    );
  }

  return (
    <div className="kpi-card group !p-8 hover:shadow-2xl transition-all duration-500">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
           <div className="w-14 h-14 rounded-2xl bg-[#F9F7F2] flex items-center justify-center text-[#0F4335] shadow-inner group-hover:bg-[#C5A358] group-hover:text-white transition-all duration-500">
              {Icon && <Icon className="w-7 h-7" />}
           </div>
           <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest">
              +12.5%
           </div>
        </div>
        
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{title}</p>
          <div className="text-4xl font-black text-[#0F4335] serif-font italic group-hover:text-[#C5A358] transition-colors">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
