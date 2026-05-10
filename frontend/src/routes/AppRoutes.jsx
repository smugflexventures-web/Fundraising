import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Layouts (eager - needed immediately)
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages (lazy)
const LandingPage = lazy(() => import('../pages/LandingPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const CampaignsPage = lazy(() => import('../pages/CampaignsPage'));
const CampaignDetailPage = lazy(() => import('../pages/CampaignDetailPage'));

// Auth Pages (lazy)
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

// Student Pages (lazy)
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const StudentRequests = lazy(() => import('../pages/student/StudentRequests'));
const NewRequestPage = lazy(() => import('../pages/student/NewRequestPage'));
const RequestDetailPage = lazy(() => import('../pages/student/RequestDetailPage'));

// Donor Pages (lazy)
const DonorDashboard = lazy(() => import('../pages/donor/DonorDashboard'));
const DonorDonations = lazy(() => import('../pages/donor/DonorDonations'));
const DonatePage = lazy(() => import('../pages/donor/DonatePage'));
const DonationVerifyPage = lazy(() => import('../pages/donor/DonationVerifyPage'));

// Admin Pages (lazy)
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminRequests = lazy(() => import('../pages/admin/AdminRequests'));
const AdminCampaigns = lazy(() => import('../pages/admin/AdminCampaigns'));
const AdminDonations = lazy(() => import('../pages/admin/AdminDonations'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminActivityLogs = lazy(() => import('../pages/admin/AdminActivityLogs'));

// Shared Pages (lazy)
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
  </div>
);

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const getDashboardRedirect = () => {
    if (!isAuthenticated) return '/login';
    switch (user?.role) {
      case 'admin': return '/admin';
      case 'student': return '/student';
      case 'donor': return '/donor';
      default: return '/login';
    }
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/donation/verify" element={<DonationVerifyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/dashboard-redirect" element={<Navigate to={getDashboardRedirect()} replace />} />
        </Route>

        {/* Student Routes */}
        <Route element={<ProtectedRoute roles={['student']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/requests" element={<StudentRequests />} />
          <Route path="/student/requests/new" element={<NewRequestPage />} />
          <Route path="/student/requests/:id" element={<RequestDetailPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Donor Routes */}
        <Route element={<ProtectedRoute roles={['donor']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/donor/donations" element={<DonorDonations />} />
          <Route path="/donor/donate/:campaignId?" element={<DonatePage />} />
          <Route path="/donor/donate-request/:requestId" element={<DonatePage />} />
          <Route path="/donor/profile" element={<ProfilePage />} />
          <Route path="/donor/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/campaigns" element={<AdminCampaigns />} />
          <Route path="/admin/donations" element={<AdminDonations />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
