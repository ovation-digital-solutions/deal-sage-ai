import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link 
              href="/" 
              className="text-lg font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Meridex AI
            </Link>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/privacy" 
              className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-slate-500">
            © {currentYear} Meridex AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
