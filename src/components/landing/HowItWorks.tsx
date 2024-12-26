import React from 'react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
      title: "Find Property Data",
      description: "Search and discover comprehensive property data to kickstart your due diligence process.",
      features: [
        "Property search",
        "Market data access",
        "Due diligence tools"
      ]
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a9 9 0 1 0 9 9"/>
          <path d="M12 8a3 3 0 1 0 3 3"/>
          <line x1="12" y1="2" x2="12" y2="4"/>
          <line x1="20" y1="11" x2="22" y2="11"/>
        </svg>
      ),
      title: "Compare Investments",
      description: "Compare property data across multiple dimensions to evaluate investment opportunities.",
      features: [
        "Side-by-side comparison",
        "Performance metrics",
        "Market benchmarking"
      ]
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
          <path d="M2 20h20"/>
        </svg>
      ),
      title: "Make Smarter Decisions",
      description: "Let our AI analyzer help you make faster, data-driven investment decisions.",
      features: [
        "AI recommendations",
        "Investment insights",
        "Decision support"
      ]
    }
  ];

  return (
    <div className="bg-slate-900 py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-emerald-900/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-emerald-900/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <div className="inline-flex items-center justify-center space-x-2 bg-emerald-950/50 rounded-full px-3 sm:px-4 py-1 mb-4 sm:mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span className="text-emerald-400 text-xs sm:text-sm font-medium">Simple Yet Powerful</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            How Meridex AI
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent"> Works</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Transform your real estate investment process with our advanced AI platform in three simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="h-full p-6 sm:p-8 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-emerald-500/50 transition-all duration-300">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm sm:text-base font-bold">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="mb-4 sm:mb-6">
                  <div className="mb-4 p-2 sm:p-3 bg-slate-800 rounded-lg inline-block">
                    {step.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm sm:text-base mb-4 sm:mb-6">{step.description}</p>
                </div>

                {/* Features List */}
                <ul className="space-y-2 sm:space-y-3">
                  {step.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-300 text-sm sm:text-base">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 sm:p-8 mt-8 sm:mt-12">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Start Making Smarter Investment Decisions
            </h3>
            <p className="text-slate-400 text-sm sm:text-base mb-4 sm:mb-6 px-4">
              Transform your real estate due diligence process with AI-powered analysis and insights.
            </p>
            <a 
              href="/register" 
              className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span className="text-lg">Get Started Today</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;
