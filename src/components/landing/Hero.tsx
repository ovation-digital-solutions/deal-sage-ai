import React from 'react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-y-0 -left-4 w-1/3 bg-gradient-to-r from-emerald-600 to-emerald-400 blur-3xl transform -skew-x-12" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-emerald-900 to-transparent blur-3xl transform skew-x-12" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="text-center space-y-8 sm:space-y-12">
          {/* Logo/Brand */}
          <div className="flex flex-col items-center justify-center space-y-1 mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 bg-clip-text text-transparent">
              MERIDEX AI
            </h2>
            <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
          </div>

          {/* Main Heading */}
          <div className="space-y-3 sm:space-y-5">
            <span className="text-xs sm:text-sm font-medium text-emerald-400">AI-Powered Real Estate Analysis</span>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white px-4">
              Smart Due Diligence for
              <span className="block sm:inline bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent"> Real Estate Investments</span>
            </h1>
            
            <p className="max-w-xl sm:max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-slate-300 px-4">
              Find and compare property data to accelerate your due diligence process. Our AI analyzer helps you make faster, smarter investment decisions.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center px-4">
            <a 
              href="/register" 
              className="
                px-4 sm:px-6 md:px-8 lg:px-10
                py-2 sm:py-3 md:py-3.5 lg:py-4
                text-sm sm:text-base md:text-lg lg:text-xl
                font-medium rounded-lg
                bg-emerald-500 hover:bg-emerald-600
                text-white transition-colors
                w-full sm:w-auto max-w-xs
                text-center
              "
            >
              Sign Up Now
            </a>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-8 sm:pt-12 px-4">
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 p-4 sm:p-6 lg:p-8 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-emerald-500/50 transition-colors group">
              <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">Find</h3>
              <p className="text-sm sm:text-base text-slate-300">Find property data to accelerate your process</p>
            </div>
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 p-4 sm:p-6 lg:p-8 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-emerald-500/50 transition-colors group">
              <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">Compare</h3>
              <p className="text-sm sm:text-base text-slate-300">Compare property data to accelerate your process</p>
            </div>
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 p-4 sm:p-6 lg:p-8 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-emerald-500/50 transition-colors group sm:col-span-2 lg:col-span-1">
              <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">Chat</h3>
              <p className="text-sm sm:text-base text-slate-300">Chat with property data to accelerate your process</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
