import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Search, Filter, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, calculateProgress, getCategoryLabel } from '../utils/helpers';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const categories = ['tuition', 'housing', 'medical', 'feeding', 'books', 'emergency', 'general'];

  useEffect(() => {
    fetchCampaigns();
  }, [page, category]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 9 };
      if (category) params.category = category;
      const res = await api.campaigns.getAll(params);
      const data = res.data;
      setCampaigns(data.data || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Active Campaigns</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Browse active fundraising campaigns and help students achieve their educational goals
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              !category ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                category === cat ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No campaigns found</h3>
            <p className="text-sm text-gray-400">Check back later for new campaigns</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign, i) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm"
                >
                  <div className="h-48 bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center relative">
                    {campaign.image ? (
                      <img src={`/${campaign.image}`} alt={campaign.title} className="w-full h-full object-cover" />
                    ) : (
                      <Heart className="w-12 h-12 text-white/50" />
                    )}
                    {campaign.is_featured && (
                      <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {getCategoryLabel(campaign.category)}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2 line-clamp-1">{campaign.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{campaign.short_description || campaign.description}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700">{formatCurrency(campaign.raised_amount)}</span>
                        <span className="text-gray-400">of {formatCurrency(campaign.target_amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${calculateProgress(campaign.raised_amount, campaign.target_amount)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {calculateProgress(campaign.raised_amount, campaign.target_amount)}% funded
                      </p>
                    </div>
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      View Details <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;
