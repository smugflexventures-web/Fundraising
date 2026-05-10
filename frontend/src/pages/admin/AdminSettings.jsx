import { useState, useEffect } from 'react';
import { Save, Globe, DollarSign, Shield, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    site_name: 'CampusFund',
    site_description: 'Campus Fundraising and Donation Management System',
    currency: 'NGN',
    currency_symbol: 'NGN',
    min_donation_amount: '1000',
    max_donation_amount: '10000000',
    enable_registration: 'true',
    enable_email_verification: 'true',
    maintenance_mode: 'false',
    bank_name: 'First Bank of Nigeria',
    bank_account_number: '2031234567',
    bank_account_name: 'CampusFund Educational Support',
    bank_sort_code: '011151003',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.admin.getSettings();
        if (res.data.data.settings) {
          setSettings(prev => ({ ...prev, ...res.data.data.settings }));
        }
      } catch {
        toast.error('Configuration could not be loaded at this time');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.updateSettings(settings);
      toast.success('Configuration updated');
    } catch {
      toast.error('Configuration could not be saved at this time');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Platform Configuration</h1>

      <div className="max-w-3xl space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800">Site Identity</h3>
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
            <h3 className="text-lg font-semibold text-gray-800">Currency &amp; Contribution Limits</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Donation (NGN)</label>
              <input type="number" value={settings.min_donation_amount} onChange={(e) => setSettings({...settings, min_donation_amount: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Donation (NGN)</label>
              <input type="number" value={settings.max_donation_amount} onChange={(e) => setSettings({...settings, max_donation_amount: e.target.value})} className="input-field" />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800">Feature Controls</h3>
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
                  onClick={() => setSettings({...settings, [toggle.key]: settings[toggle.key] === 'true' ? 'false' : 'true'})}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    settings[toggle.key] === 'true' ? 'bg-primary-600' : 'bg-gray-300'
                  }`
                }
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings[toggle.key] === 'true' ? 'translate-x-4' : ''
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Account Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800">Bank Account for Manual Transfers</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">These details are shown to donors who select the bank transfer payment method.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input value={settings.bank_name || ''} onChange={(e) => setSettings({...settings, bank_name: e.target.value})} className="input-field" placeholder="e.g. First Bank of Nigeria" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input value={settings.bank_account_number || ''} onChange={(e) => setSettings({...settings, bank_account_number: e.target.value})} className="input-field font-mono" placeholder="2031234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
                <input value={settings.bank_sort_code || ''} onChange={(e) => setSettings({...settings, bank_sort_code: e.target.value})} className="input-field font-mono" placeholder="011151003" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input value={settings.bank_account_name || ''} onChange={(e) => setSettings({...settings, bank_account_name: e.target.value})} className="input-field" placeholder="CampusFund Educational Support" />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
