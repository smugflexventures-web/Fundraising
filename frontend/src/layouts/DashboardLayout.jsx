import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  User,
  Heart,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardLayout = () => {
  const { user, logout, isStudent, isDonor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.notifications.getUnreadCount();
        setUnreadCount(res.data.data.unread_count);
      } catch {}
    };
    fetchUnread();
  }, []);

  const studentLinks = [
    { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/requests', icon: FileText, label: 'My Requests' },
    { path: '/student/requests/new', icon: PlusCircle, label: 'New Request' },
    { path: '/student/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { path: '/student/profile', icon: User, label: 'Profile' },
  ];

  const donorLinks = [
    { path: '/donor', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/donor/donate', icon: Heart, label: 'Donate' },
    { path: '/donor/donations', icon: FileText, label: 'My Donations' },
    { path: '/donor/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { path: '/donor/profile', icon: User, label: 'Profile' },
  ];

  const links = isStudent ? studentLinks : donorLinks;

  const isActive = (path) => {
    if (path === '/student' || path === '/donor') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass h-14 flex items-center px-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="ml-3 font-semibold text-gradient">CampusFund</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient">CampusFund</span>
          </Link>
        </div>

        <div className="px-4 mb-4">
          <div className="bg-primary-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Welcome back</p>
            <p className="text-sm font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-primary-600 capitalize">{user?.role}</p>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${isActive(link.path) ? 'active' : 'text-gray-600'}`}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
              {link.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button onClick={handleLogout} className="sidebar-link text-red-600 hover:bg-red-50 w-full">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
