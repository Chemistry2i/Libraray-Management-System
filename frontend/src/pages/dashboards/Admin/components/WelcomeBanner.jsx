import React from 'react';

const WelcomeBanner = ({ user }) => {
  return (
    <div className="bg-primary rounded-2xl p-10 min-h-[150px] mb-8 shadow-md text-white flex justify-between items-center relative overflow-hidden">
      {/* Decorative background elements to make the taller banner look dynamic */}
      <div className="absolute -top-8 -right-10 w-72 h-72 rounded-full bg-white opacity-10"></div>
      <div className="absolute -bottom-24 right-48 w-56 h-56 rounded-full bg-white opacity-5"></div>
      
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-3 tracking-tight">
          Welcome back, {user?.firstName || 'Admin'}! 👋
        </h1>
        <p className="text-white/90 text-lg max-w-xl">
          Here is what's happening with your library system today. Review pending reservations, recent borrowings, and system metrics below.
        </p>
      </div>
      
      <div className="hidden sm:block relative z-10">
        <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">System Status</p>
          <p className="text-green-300 font-bold flex items-center gap-2 text-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse ring-4 ring-green-400/30"></span> 
            All Systems Go
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
