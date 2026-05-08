import { useState } from 'react';
import { User, Mail, Phone, Lock, Save, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      });
      toast.success('Password changed successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="max-w-2xl">
        {/* Profile Header */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {(user?.first_name?.[0] || '')}{(user?.last_name?.[0] || '')}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{user?.first_name} {user?.last_name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full capitalize mt-1 inline-block">
                {user?.role}
              </span>
            </div>
          </div>
          {user?.role === 'student' && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-sm"><span className="text-gray-500">Student ID:</span> <span className="font-medium">{user?.student_id || 'N/A'}</span></div>
              <div className="text-sm"><span className="text-gray-500">Department:</span> <span className="font-medium">{user?.department || 'N/A'}</span></div>
              <div className="text-sm"><span className="text-gray-500">Level:</span> <span className="font-medium">{user?.level || 'N/A'}</span></div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border'
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'password' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border'
            }`}
          >
            Change Password
          </button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileUpdate} className="glass rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input value={profileData.first_name} onChange={(e) => setProfileData({...profileData, first_name: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input value={profileData.last_name} onChange={(e) => setProfileData({...profileData, last_name: e.target.value})} className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="glass rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" value={passwordData.current_password} onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Lock className="w-4 h-4" /> {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
