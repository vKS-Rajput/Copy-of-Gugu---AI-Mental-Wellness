import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, AudioWaveform, Heart, Video, User, Home, MessageCircle } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'AI Chat', path: '/chat', icon: <MessageCircle size={18} /> },
    { name: 'Therapists', path: '/therapists', icon: <Heart size={18} /> },
    { name: 'Resources', path: '/videos', icon: <Video size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <User size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Don't show navigation on Sign In page
  if (location.pathname === '/signin') {
      return (
          <div className="min-h-screen bg-brand-dark text-gray-200 font-sans selection:bg-brand-accent selection:text-black">
              {children}
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 font-sans selection:bg-brand-accent selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="text-brand-accent group-hover:text-teal-300 transition-colors">
                  <AudioWaveform size={28} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl tracking-tight text-white group-hover:text-brand-accent transition-colors">Gugu</span>
                </div>
              </Link>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive(item.path)
                        ? 'text-brand-accent bg-white/5'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="hidden md:block">
               <Link to="/signin">
                 <button className="bg-brand-accent text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-teal-300 transition-all shadow-[0_0_15px_rgba(45,212,191,0.2)] hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]">
                   Sign In
                 </button>
               </Link>
            </div>

            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-b border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'text-brand-accent bg-white/5'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
               <Link
                  to="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-brand-accent hover:bg-white/5 flex items-center gap-2"
                >
                  <User size={18} />
                  Sign In
                </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-[#0a0a0a] mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                     <AudioWaveform size={24} className="text-brand-accent" />
                     <span className="font-bold text-xl text-white">Gugu</span>
                </div>
                <p className="text-gray-500 text-sm max-w-xs">
                    Your digital companion for emotional wellness. Guide U, Guide Us.
                </p>
            </div>
            <div>
                <h4 className="font-semibold text-white mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-500 text-sm">
                    <li><Link to="/chat" className="hover:text-brand-accent">AI Companion</Link></li>
                    <li><Link to="/therapists" className="hover:text-brand-accent">Therapists</Link></li>
                    <li><Link to="/videos" className="hover:text-brand-accent">Resources</Link></li>
                </ul>
            </div>
             <div>
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-gray-500 text-sm">
                    <li><span className="cursor-pointer hover:text-brand-accent">About Us</span></li>
                    <li><span className="cursor-pointer hover:text-brand-accent">Privacy Policy</span></li>
                    <li><span className="cursor-pointer hover:text-brand-accent">Terms of Service</span></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-xs border-t border-white/5 pt-8">
          <p>&copy; 2025 Gugu Wellness. All rights reserved.</p>
          <p className="mt-2">Gugu is an AI companion and does not replace professional medical advice. In a crisis, please call emergency services.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;