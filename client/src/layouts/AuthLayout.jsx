import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-[#C5A358] rounded-2xl flex items-center justify-center shadow-lg shadow-black/5">
            <span className="text-[#0F4335] font-black text-2xl serif-font italic">S</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#0F4335] serif-font italic">
            SprintHub
          </h1>
        </div>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-10 shadow-[0_20px_60px_-15px_rgba(15,67,53,0.1)] border-none rounded-[3rem]">
          <Outlet />
        </div>
        
        <p className="mt-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} SprintHub — Strategic Collaboration
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
