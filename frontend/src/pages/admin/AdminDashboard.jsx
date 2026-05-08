import { useState, useEffect } from 'react';
import { Users, DollarSign, FileText, Target, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.admin.getStats();
      setStats(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div className="text-center py-12">Failed to load stats</div>;

  const monthlyData = (stats.donations?.monthly || []).map((item) => ({
    name: new Date(2024, item.month - 1).toLocaleString('default', { month: 'short' }),
    amount: parseFloat(item.total),
    count: item.count,
  }));

  const categoryData = (stats.requests?.by_category || []).map((item) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.count,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">System overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Students" value={stats.users?.total_students || 0} icon={Users} color="primary" />
        <StatCard title="Total Donors" value={stats.users?.total_donors || 0} icon={Users} color="accent" />
        <StatCard title="Total Donations" value={formatCurrency(stats.donations?.total_amount)} icon={DollarSign} color="purple" />
        <StatCard title="Pending Requests" value={stats.requests?.pending || 0} icon={Clock} color="warm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Approved Requests" value={stats.requests?.approved || 0} icon={CheckCircle} color="accent" />
        <StatCard title="Funded Requests" value={stats.requests?.funded || 0} icon={FileText} color="info" />
        <StatCard title="Active Campaigns" value={stats.campaigns?.active || 0} icon={Target} color="primary" />
        <StatCard title="Total Raised" value={formatCurrency(stats.campaigns?.total_raised)} icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Donations Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Donations</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No donation data yet</div>
          )}
        </div>

        {/* Requests by Category */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Requests by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No request data yet</div>
          )}
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Donations</h3>
        {(stats.recent_donations || []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Donor</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Amount</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Date</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_donations.map((donation) => (
                  <tr key={donation.id} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-800">
                      {donation.is_anonymous ? 'Anonymous' : `${donation.donor_first_name} ${donation.donor_last_name}`}
                    </td>
                    <td className="px-3 py-2 text-sm font-semibold text-accent-600">{formatCurrency(donation.amount)}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{new Date(donation.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        donation.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">No recent donations</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
