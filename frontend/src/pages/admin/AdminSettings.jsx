import { useState } from 'react';
import { Save, Globe, DollarSign, Mail, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    site_name: 'CampusFund',
    site_description: 'Campus Fundraising and Donation Management System',
    currency: 'NGN',
    currency_symbol: '₦',
    min_donation_amount: '1000',
    max_donation_amount: '10000000',
    enable_registration: true,
    enable_email_verification: true,
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call an API endpoint
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h1>

      <div className="max-w-3xl space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800">General</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input value={settings.site_name} onChange={(e) => setSettings({...settings, site_name: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <textarea value={settings.site_description} onChange={(e) => setSettings({...settings, site_description: e.target.value})} className="input-field min-h-[80px]" />
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800">Currency & Donations</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
              <input value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
              <input value={settings.currency_symbol} onChange={(e) => setSettings({...settings, currency_symbol: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Donation (₦)</label>
              <input type="number" value={settings.min_donation_amount} onChange={(e) => setSettings({...settings, min_donation_amount: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Donation (₦)</label>
              <input type="number" value={settings.max_donation_amount} onChange={(e) => setSettings({...settings, max_donation_amount: e.target.value})} className="input-field" />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800">Features</h3>
          </div>
          <div className="space-y-4">
            {[
              { key: 'enable_registration', label: 'Enable Registration', desc: 'Allow new users to register' },
              { key: 'enable_email_verification', label: 'Email Verification', desc: 'Require email verification for new accounts' },
              { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Put the site in maintenance mode' },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{toggle.label}</p>
                  <p className="text-xs text-gray-400">{toggle.desc}</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, [toggle.key]: !settings[toggle.key]})}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    settings[toggle.key] ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings[toggle.key] ? 'translate-x-4' : ''
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
