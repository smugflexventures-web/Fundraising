import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, DollarSign, MessageSquare, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { toast } from 'react-toastify';

const DonatePage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCampaign, setFetchingCampaign] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    is_anonymous: false,
    campaign_id: campaignId || '',
  });

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    setFetchingCampaign(true);
    try {
      const res = await api.campaigns.getById(campaignId);
      setCampaign(res.data.data.campaign);
      setFormData(prev => ({ ...prev, campaign_id: campaignId }));
    } catch {} finally {
      setFetchingCampaign(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) < 1000) {
      toast.error('Minimum donation amount is ₦1,000');
      return;
    }

    setLoading(true);
    try {
      const res = await api.donations.initialize({
        amount: parseFloat(formData.amount),
        campaign_id: formData.campaign_id || null,
        message: formData.message || null,
        is_anonymous: formData.is_anonymous,
      });

      const { authorization_url, reference } = res.data.data;

      toast.info('Redirecting to payment gateway...');

      // For Paystack inline popup approach
      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: res.data.data.public_key,
          email: '',
          amount: parseFloat(formData.amount) * 100,
          ref: reference,
          onClose: () => {
            toast.warning('Payment window closed');
          },
          callback: async (response) => {
            try {
              await api.donations.verify(response.reference);
              toast.success('Donation successful! Thank you for your generosity.');
              navigate('/donor/donations');
            } catch {
              toast.error('Payment verification failed');
            }
          },
        });
        handler.openIframe();
      } else {
        // Fallback: redirect to Paystack authorization URL
        window.location.href = authorization_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [5000, 10000, 25000, 50000, 100000];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Make a Donation</h1>

      <div className="max-w-2xl">
        {fetchingCampaign && <Loader2 className="w-6 h-6 animate-spin text-primary-600" />}

        {campaign && (
          <div className="glass rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800">{campaign.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(campaign.raised_amount)} raised of {formatCurrency(campaign.target_amount)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Donation Amount (₦) *</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    formData.amount === amount.toString()
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input-field"
              placeholder="Or enter custom amount"
              min="1000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="Leave a message of encouragement"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_anonymous: !formData.is_anonymous })}
              className={`w-10 h-6 rounded-full transition-colors ${
                formData.is_anonymous ? 'bg-primary-600' : 'bg-gray-300'
              } relative`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                formData.is_anonymous ? 'translate-x-4' : ''
              }`} />
            </button>
            <span className="text-sm text-gray-600">Donate anonymously</span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" /> Donate {formData.amount ? formatCurrency(formData.amount) : ''}
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Payments are securely processed via Paystack. Your data is encrypted and protected.
          </p>
        </form>
      </div>
    </div>
  );
};

export default DonatePage;
