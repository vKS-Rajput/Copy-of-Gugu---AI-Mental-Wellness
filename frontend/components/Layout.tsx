import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Leaf, User, HeartHandshake, LayoutDashboard, Stethoscope, LogOut, Video, Users, CalendarDays, ClipboardList, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isChat = location.pathname === '/chat';

  // Desktop sidebar nav class
  const getSidebarClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
      ? 'bg-sage-500 text-white shadow-md font-semibold'
      : 'text-sage-500 hover:bg-sage-50 hover:text-sage-700 font-medium'
      }`;
  };

  // Mobile bottom nav class
  const getMobileClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 ${isActive
      ? 'text-sage-600 font-bold'
      : 'text-sage-400 hover:text-sage-500'
      }`;
  };

  // Top nav for unauthenticated users
  const getTopNavClass = (path: string) => {
    const isActive = location.pathname === path;
    return `px-4 py-2 rounded-full transition-all duration-300 ${isActive
      ? 'text-sage-700 bg-sage-100 font-semibold'
      : 'text-sage-400 hover:text-sage-600 hover:bg-sage-50 font-medium'
      }`;
  };

  // ------------------------------------------------------------------
  // UNAUTHENTICATED LAYOUT
  // ------------------------------------------------------------------
  if (!user) {
    return (
      <div className="flex flex-col bg-warm-50 min-h-[100dvh]">
        <nav className="bg-white border-b border-sage-100 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 bg-sage-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-sage-600 transition-colors">
                    <Leaf size={18} className="text-white" />
                  </div>
                  <span className="font-serif text-xl font-bold text-sage-800">Gugu</span>
                </Link>
              </div>

              <div className="hidden sm:flex sm:items-center sm:space-x-2">
                <Link to="/" className={getTopNavClass('/')}>Home</Link>
                <Link to="/resources" className={getTopNavClass('/resources')}>Resources</Link>
              </div>

              <div className="flex items-center">
                <Link to="/signin" className="bg-sage-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-sage-600 transition-colors shadow-sm">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // AUTHENTICATED LAYOUT (Vertical Sidebar)
  // ------------------------------------------------------------------
  return (
    <div className="flex h-[100dvh] bg-warm-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="w-68 bg-white border-r border-sage-100 hidden sm:flex flex-col shadow-sm relative z-20">
        <div className="h-20 flex items-center px-6 border-b border-sage-50">
          <Link to={user.role === 'patient' ? '/dashboard' : '/therapist-dashboard'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-sage-500 rounded-2xl flex items-center justify-center shadow-md group-hover:bg-sage-600 transition-colors">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-sage-800 tracking-tight">Gugu</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
          <div className="px-3 mb-2">
            <p className="text-xs font-bold text-sage-300 uppercase tracking-wider">Main</p>
          </div>

          {user.role === 'patient' && (
            <>
              <Link to="/dashboard" className={getSidebarClass('/dashboard')}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/chat" className={getSidebarClass('/chat')}>
                <HeartHandshake size={20} />
                <span>Talk to Gugu</span>
              </Link>
              <Link to="/therapists" className={getSidebarClass('/therapists')}>
                <Stethoscope size={20} />
                <span>My Therapists</span>
              </Link>
            </>
          )}

          {user.role === 'therapist' && (
            <>
              <Link to="/therapist-dashboard" className={getSidebarClass('/therapist-dashboard')}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/patients" className={getSidebarClass('/patients')}>
                <Users size={20} />
                <span>My Clients</span>
              </Link>
              <Link to="/schedule" className={getSidebarClass('/schedule')}>
                <CalendarDays size={20} />
                <span>My Schedule</span>
              </Link>
              <Link to="/notes" className={getSidebarClass('/notes')}>
                <ClipboardList size={20} />
                <span>Session Notes</span>
              </Link>
              <Link to="/therapist-settings" className={getSidebarClass('/therapist-settings')}>
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-sage-50 bg-sage-50/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-sage-200 border-2 border-white shadow-sm flex items-center justify-center text-sage-600 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-sage-800 truncate">{user.name}</p>
              <p className="text-xs text-sage-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-sage-200 text-clay-500 rounded-xl hover:bg-clay-50 hover:border-clay-200 transition-all shadow-sm font-semibold text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto w-full">
        {/* Mobile Header (Only visible on highly mobile screens if needed, otherwise hidden, keeping it clean) */}
        <div className="sm:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-sage-100 sticky top-0 z-30 shadow-sm">
          <Link to={user.role === 'patient' ? '/dashboard' : '/therapist-dashboard'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-serif text-lg font-bold text-sage-800">Gugu</span>
          </Link>
          <button onClick={logout} className="text-sage-400 hover:text-clay-500 p-2">
            <LogOut size={20} />
          </button>
        </div>

        <div className={`flex-1 flex flex-col ${isChat && 'h-full'}`}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {!isChat && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sage-100 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-around items-center h-16">
            {user.role === 'patient' && (
              <>
                <Link to="/dashboard" className={getMobileClass('/dashboard')}>
                  <LayoutDashboard size={20} className="mb-1" />
                  <span className="text-[10px]">Dashboard</span>
                </Link>
                <Link to="/chat" className={getMobileClass('/chat')}>
                  <HeartHandshake size={20} className="mb-1" />
                  <span className="text-[10px]">Talk</span>
                </Link>
                <Link to="/therapists" className={getMobileClass('/therapists')}>
                  <Stethoscope size={20} className="mb-1" />
                  <span className="text-[10px]">Therapists</span>
                </Link>
              </>
            )}

            {user.role === 'therapist' && (
              <>
                <Link to="/therapist-dashboard" className={getMobileClass('/therapist-dashboard')}>
                  <LayoutDashboard size={20} className="mb-1" />
                  <span className="text-[10px]">Dashboard</span>
                </Link>
                <Link to="/patients" className={getMobileClass('/patients')}>
                  <Users size={20} className="mb-1" />
                  <span className="text-[10px]">Clients</span>
                </Link>
                <Link to="/schedule" className={getMobileClass('/schedule')}>
                  <CalendarDays size={20} className="mb-1" />
                  <span className="text-[10px]">Schedule</span>
                </Link>
                <Link to="/notes" className={getMobileClass('/notes')}>
                  <ClipboardList size={20} className="mb-1" />
                  <span className="text-[10px]">Notes</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;