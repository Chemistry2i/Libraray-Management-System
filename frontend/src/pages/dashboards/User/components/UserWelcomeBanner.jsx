import React from 'react';
import { BookMarked } from 'lucide-react';

const UserWelcomeBanner = ({ user }) => {
  return (
    <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-4 md:p-10 min-h-[120px] md:min-h-[150px] mb-4 md:mb-8 shadow-md text-white flex flex-col md:flex-row md:justify-between md:items-center relative overflow-hidden gap-4">
      {/* Decorative background elements */}
      <div className="absolute -top-8 -right-10 w-72 h-72 rounded-full bg-white opacity-10"></div>
      <div className="absolute -bottom-24 right-48 w-56 h-56 rounded-full bg-white opacity-5"></div>
      
      <div className="relative z-10">
        <h1 className="text-lg md:text-3xl font-bold mb-2 md:mb-3 tracking-tight">
          Welcome back, {user?.firstName || 'Reader'}! 📖
        </h1>
        <p className="text-white/90 text-xs md:text-lg max-w-xl">
          Explore our collection, manage your borrowed books, and discover your next favorite read.
        </p>
      </div>
      
      <div className="hidden sm:block relative z-10">
        <div className="bg-white/10 p-3 md:p-5 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2 flex items-center gap-2">
            <BookMarked size={14} /> Member Status
          </p>
          <p className="text-green-300 font-bold flex items-center gap-2 text-base md:text-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse ring-4 ring-green-400/30"></span> 
            Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserWelcomeBanner;
