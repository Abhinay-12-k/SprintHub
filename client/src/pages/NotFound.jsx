import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-8 animate-fade-in">
      <div className="text-center max-w-xl">
        <div className="mb-12 relative">
          <span className="text-[12rem] font-black text-[#0F4335]/5 serif-font italic leading-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-24 h-24 bg-[#C5A358] rounded-[2.5rem] shadow-xl flex items-center justify-center">
                <span className="text-[#0F4335] font-black text-3xl serif-font">?</span>
             </div>
          </div>
        </div>
        <h1 className="text-5xl font-black text-[#0F4335] serif-font italic mb-6">Lost in Strategy</h1>
        <p className="text-xl text-slate-400 italic serif-font mb-12 max-w-md mx-auto">
          The tactical node you are seeking is currently unavailable or has been decommissioned.
        </p>
        <Link to="/dashboard" className="btn-primary mx-auto w-fit px-10 py-5">
          <HiOutlineArrowLeft className="w-5 h-5 text-[#C5A358]" />
          RETURN TO COMMAND
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
