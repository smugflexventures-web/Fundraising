import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Calendar, Target, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency, formatDate, calculateProgress, getCategoryLabel } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const CampaignDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, isDonor } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const res = await api.campaigns.getById(id);
      setCampaign(res.data.data.campaign);
    } catch {
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!campaign) return <div className="text-center py-20"><h2>Campaign not found</h2></div>;

  const progress = calculateProgress(campaign.raised_amount, campaign.target_amount);

  const handleDonate = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isDonor) {
      navigate(`/donor/donate/${campaign.id}`);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Campaigns
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="h-64 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center mb-6 overflow-hidden">
                {campaign.image ? (
                  <img src={`/${campaign.image}`} alt={campaign.title} className="w-full h-full object-cover" />
                ) : (
                  <Heart className="w-16 h-16 text-white/50" />
                )}
              </div>

              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                {getCategoryLabel(campaign.category)}
              </span>

              <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-4">{campaign.title}</h1>

              <div className="prose prose-sm max-w-none text-gray-600 mb-8">
                <p className="whitespace-pre-wrap">{campaign.description}</p>
              </div>

              {/* Recent Donations */}
              {campaign.donations && campaign.donations.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Donations</h3>
                  <div className="space-y-3">
                    {campaign.donations.slice(0, 5).map((donation) => (
                      <div key={donation.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-600">
                            {donation.is_anonymous ? '?' : (donation.donor_first_name?.[0] || 'D')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {donation.is_anonymous ? 'Anonymous Donor' : `${donation.donor_first_name} ${donation.donor_last_name}`}
                          </p>
                          {donation.message && <p className="text-xs text-gray-500">{donation.message}</p>}
                        </div>
                        <span className="text-sm font-semibold text-accent-600">{formatCurrency(donation.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-800">{formatCurrency(campaign.raised_amount)}</span>
                  <span className="text-gray-400">{formatCurrency(campaign.target_amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{progress}% funded</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span>Goal: {formatCurrency(campaign.target_amount)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{campaign.donors_count || 0} donors</span>
                </div>
                {campaign.end_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Ends: {formatDate(campaign.end_date)}</span>
                  </div>
                )}
              </div>

              <button onClick={handleDonate} className="btn-primary w-full flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" /> Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage;
