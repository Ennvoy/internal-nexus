import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Library, 
  Link as LinkIcon, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  Zap,
  Settings
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive(to)
          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive(to) ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span className="font-medium tracking-wide">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900/80 backdrop-blur-xl border-r border-white/5
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/30">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Nexus 平台
                  </h1>
                  <p className="text-xs text-slate-500">內部工具與合作入口</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <div className="mb-6">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">主要功能</p>
                <NavItem to="/" icon={LayoutDashboard} label="儀表板" />
                <NavItem to="/features" icon={Library} label="功能展示區" />
                <NavItem to="/links" icon={LinkIcon} label="異業合作連結" />
              </div>

              {hasPermission([UserRole.ADMIN]) && (
                <div className="mb-6">
                  <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">後台管理</p>
                  <NavItem to="/admin/features" icon={Settings} label="功能內容管理" />
                  <NavItem to="/admin/links" icon={LinkIcon} label="合作連結管理" />
                  <NavItem to="/admin/users" icon={Users} label="使用者管理" />
                </div>
              )}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-white/5 bg-slate-900/50">
              <div className="flex items-center gap-3 mb-4 px-2">
                <Link to="/profile" className="flex items-center gap-3 w-full">
                  <img 
                    src={user?.avatarUrl || "https://picsum.photos/200"} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full border-2 border-slate-700"
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <p className="text-xs text-slate-400 truncate">
                        {user?.role === UserRole.ADMIN ? '系統管理員' : 
                         user?.role === UserRole.STAFF ? '內部同仁' : '合作夥伴'}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                登出系統
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Mobile Header */}
          <header className="h-16 lg:hidden flex items-center justify-between px-4 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl z-30">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">Nexus</span>
             </div>
             <button 
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="p-2 text-slate-400 hover:text-white"
             >
               {isMobileMenuOpen ? <X /> : <Menu />}
             </button>
          </header>

          {/* Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto w-full">
               {children}
            </div>
            
            {/* Footer / Support Link */}
            <div className="max-w-7xl mx-auto w-full mt-12 py-6 border-t border-white/5 text-center lg:text-left">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                  <p>&copy; 2025 Nexus Internal Tools. All rights reserved.</p>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
