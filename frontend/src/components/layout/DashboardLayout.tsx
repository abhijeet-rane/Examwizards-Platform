import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Menu,
  X,
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  User,
  Star,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavigationItems = () => {
    // Normalize role for route: remove 'ROLE_' prefix and lowercase
    const normalizedRole = user?.role?.replace('ROLE_', '').toLowerCase();
    let dashboardHref = '/';
    if (normalizedRole === 'admin' || normalizedRole === 'instructor' || normalizedRole === 'student') {
      dashboardHref = `/${normalizedRole}`;
    }
    const baseItems = [
      { name: 'Dashboard', href: dashboardHref, icon: Home },
      { name: 'Profile', href: '/profile', icon: User },
    ];

    switch (normalizedRole) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'User Management', href: '/admin/users', icon: Users },
          { name: 'Contact Requests', href: '/admin/contact-requests', icon: MessageSquare },
          { name: 'Reviews', href: '/admin/reviews', icon: Star },
          { name: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
        ];
      case 'instructor':
        return [
          ...baseItems,
          { name: 'Create Exam', href: '/instructor/create-exam', icon: FileText },
          { name: 'My Exams', href: '/instructor/exams', icon: FileText },
          { name: 'Reviews', href: '/instructor/reviews', icon: Star },
          { name: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
        ];
      case 'student':
        return [
          ...baseItems,
          { name: 'Browse Courses', href: '/student/courses', icon: BookOpen },
          { name: 'Available Exams', href: '/student/exams', icon: FileText },
          { name: 'My Results', href: '/student/results', icon: BarChart3 },
          { name: 'Reviews', href: '/student/reviews', icon: Star },
          { name: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems(); // This now always includes all items for the current role as per the logic above

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Top bar - always at the top, full width */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 shadow-lg border-b border-indigo-700 w-full">
        <div className="flex items-center justify-between h-16 px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-indigo-100 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-4 ml-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <span className="text-white text-sm font-bold">
                  {(user?.fullName || user?.username)?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.fullName || user?.username}</p>
                <p className="text-xs text-indigo-200 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 h-[calc(100vh-4rem)]"> {/* 4rem = 64px, height of top bar */}
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col justify-between w-64 bg-gradient-to-b from-slate-800 via-slate-900 to-gray-900 shadow-2xl fixed inset-y-0 left-0 z-50 border-r border-slate-700">
          <div>
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <BookOpen className="h-8 w-8 text-white" />
                  <Sparkles className="h-4 w-4 text-amber-400 absolute -top-1 -right-1" />
                </div>
                <span className="text-xl font-bold text-white">
                  ExamWizards
                </span>
              </div>
            </div>
            <nav className="mt-8 px-4 flex-1">
              <div className="flex flex-col gap-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 hover:shadow-md'
                        }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
          <div className="p-4 border-t border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 transition-all duration-200 hover:shadow-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-800 via-slate-900 to-gray-900 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden flex flex-col justify-between border-r border-slate-700`}>
          <div>
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <BookOpen className="h-8 w-8 text-white" />
                  <Sparkles className="h-4 w-4 text-amber-400 absolute -top-1 -right-1" />
                </div>
                <span className="text-xl font-bold text-white">
                  ExamWizards
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-indigo-100 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-8 px-4 flex-1">
              <div className="flex flex-col gap-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 hover:shadow-md'
                        }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
          <div className="p-4 border-t border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 transition-all duration-200 hover:shadow-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content - scrollable */}
        <main className="flex-1 lg:ml-64 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;