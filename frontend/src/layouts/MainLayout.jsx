import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/campaigns', label: 'Campaigns' },
  ];

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin': return '/admin';
      case 'student': return '/student';
      case 'donor': return '/donor';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">CampusFund</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} className="btn-secondary text-sm">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-t"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium text-gray-600 hover:text-primary-600"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block btn-secondary text-sm text-center">
                      Dashboard
                    </Link>
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-sm text-red-600 py-2">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block btn-secondary text-sm text-center">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="block btn-primary text-sm text-center">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CampusFund</span>
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                A structured financial assistance and emergency support channel for students within the campus community.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-sm text-gray-400 hover:text-white transition-colors">About</Link>
                <Link to="/campaigns" className="block text-sm text-gray-400 hover:text-white transition-colors">Campaigns</Link>
                <Link to="/register" className="block text-sm text-gray-400 hover:text-white transition-colors">Register</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>support@campusfund.edu</p>
                <p>+234 800 000 0000</p>
                <p>University Campus, Nigeria</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CampusFund. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
