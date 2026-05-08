import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, Shield, ArrowRight, GraduationCap, Coins, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCurrency, calculateProgress } from '../utils/helpers';

const LandingPage = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [stats, setStats] = useState({ students_helped: 0, donors_count: 0, donations_count: 0, total_donated: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsRes, statsRes] = await Promise.all([
          api.campaigns.getFeatured(),
          api.stats.getPublic(),
        ]);
        setFeaturedCampaigns(campaignsRes.data.data.campaigns || []);
        if (statsRes.data.data) {
          setStats(statsRes.data.data);
        }
      } catch {} finally {
        setStatsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Heart className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">Campus Financial Assistance Portal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Structured Student<br />
              <span className="text-primary-200">Financial Support</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              A verified channel for students facing financial hardship to receive assistance from screened contributors. All disbursements are tracked and accounted for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg">
                Create Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/campaigns" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm">
                View Campaigns
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: GraduationCap, label: 'Students Assisted', value: statsLoading ? '...' : stats.students_helped.toLocaleString(), color: 'from-primary-500 to-primary-600' },
              { icon: Coins, label: 'Verified Contributions', value: statsLoading ? '...' : stats.donations_count.toLocaleString(), color: 'from-accent-500 to-accent-600' },
              { icon: BarChart3, label: 'Total Disbursed', value: statsLoading ? '...' : formatCurrency(stats.total_donated), color: 'from-purple-500 to-purple-600' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 text-center card-hover"
              >
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">A straightforward process from request to disbursement</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up and complete verification. Students and contributors each have dedicated access.', icon: Users },
              { step: '02', title: 'Submit or Browse', desc: 'Students file assistance requests with documentation. Contributors review verified campaigns.', icon: Heart },
              { step: '03', title: 'Receive or Fund', desc: 'Approved requests receive tracked disbursements. All transactions are recorded and auditable.', icon: Shield },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-2xl p-8 text-center card-hover"
              >
                <span className="text-5xl font-bold text-gradient opacity-30">{item.step}</span>
                <div className="w-14 h-14 mx-auto my-4 rounded-xl bg-primary-50 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      {featuredCampaigns.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Active Campaigns</h2>
                <p className="text-gray-500">Verified fundraising initiatives currently accepting contributions</p>
              </div>
              <Link to="/campaigns" className="hidden sm:inline-flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCampaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm"
                >
                  <div className="h-48 bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-white/50" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {campaign.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2">{campaign.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{campaign.short_description}</p>
                    <div className="mb-3">
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
            <div className="sm:hidden text-center mt-6">
              <Link to="/campaigns" className="btn-primary">Browse All Campaigns</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="gradient-primary rounded-3xl p-8 sm:p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Get Involved</h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Students can apply for verified financial assistance. Contributors can fund reviewed and approved requests through a transparent process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
                Register as Student
              </Link>
              <Link to="/register" className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-colors">
                Register as Contributor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
