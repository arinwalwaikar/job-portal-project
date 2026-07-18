import React from 'react';
import { Briefcase } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        
        {/* Brand & Copyright */}
        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <Briefcase className="h-5 w-5 text-blue-600" />
          <span>&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</span>
        </div>
        
        {/* Simple Footer Links */}
        <div className="flex space-x-6 text-sm text-slate-500">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
