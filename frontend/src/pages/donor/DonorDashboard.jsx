import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Heart, TrendingUp, Gift, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalDonated: 0, donationCount: 0, campaignsSupported: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsRes, campaignsRes] = await Promise.all([
          api.donations.history({ per_page: 5 }),
          api.campaigns.getFeatured(),
        ]);
        const donations = donationsRes.data.data || [];
        setRecentDonations(donations);
        const totalDonated = donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
        const campaignIds = new Set(donations.filter(d => d.campaign_id).map(d => d.campaign_id));
        setStats({
          totalDonated,
          donationCount: donationsRes.data.pagination?.total || donations.length,
          campaignsSupported: campaignIds.size,
        });
        setFeaturedCampaigns(campaignsRes.data.data.campaigns || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Donor Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.first_name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Donated" value={formatCurrency(stats.totalDonated)} icon={DollarSign} color="accent" />
        <StatCard title="Donations Made" value={stats.donationCount} icon={Heart} color="primary" />
        <StatCard title="Campaigns Supported" value={stats.campaignsSupported} icon={Gift} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Donations</h2>
            <Link to="/donor/donations" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
          </div>
          {recentDonations.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-600 font-medium">No donations yet</h3>
              <Link to="/donor/donate" className="btn-primary text-sm mt-3 inline-block">Make Your First Donation</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{donation.campaign_title || 'General Donation'}</h4>
                    <p className="text-sm text-gray-500">{formatDate(donation.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent-600">{formatCurrency(donation.amount)}</p>
                    <span className={`text-xs font-medium ${
                      donation.status === 'completed' ? 'text-green-600' : donation.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {donation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Featured Campaigns</h2>
            <Link to="/campaigns" className="text-sm text-primary-600 hover:text-primary-700">Browse All</Link>
          </div>
          <div className="space-y-3">
            {featuredCampaigns.slice(0, 3).map((campaign) => (
              <Link key={campaign.id} to={`/campaigns/${campaign.id}`} className="block glass rounded-xl p-4 card-hover">
                <h4 className="font-medium text-gray-800">{campaign.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{campaign.short_description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold text-primary-600">{formatCurrency(campaign.raised_amount)}</span>
                  <span className="text-xs text-gray-400">of {formatCurrency(campaign.target_amount)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
