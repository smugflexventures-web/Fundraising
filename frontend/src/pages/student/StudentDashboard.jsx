import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, DollarSign, CheckCircle, Clock, PlusCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, funded: 0, totalRequested: 0, totalFunded: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.requests.getAll({ per_page: 5 });
        const requests = res.data.data || [];
        setRecentRequests(requests);
        const totalReq = res.data.pagination?.total || 0;
        setStats({
          total: totalReq,
          pending: requests.filter(r => r.status === 'pending').length,
          approved: requests.filter(r => r.status === 'approved').length,
          funded: requests.filter(r => r.status === 'funded').length,
          totalRequested: requests.reduce((sum, r) => sum + parseFloat(r.amount_needed || 0), 0),
          totalFunded: requests.reduce((sum, r) => sum + parseFloat(r.amount_funded || 0), 0),
        });
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
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.first_name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Requests" value={stats.total} icon={FileText} color="primary" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="warm" />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="accent" />
        <StatCard title="Total Funded" value={formatCurrency(stats.totalFunded)} icon={DollarSign} color="purple" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Requests</h2>
        <Link to="/student/requests/new" className="btn-primary text-sm flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Request
        </Link>
      </div>

      {recentRequests.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No requests yet</h3>
          <p className="text-sm text-gray-400 mb-4">Submit your first assistance request</p>
          <Link to="/student/requests/new" className="btn-primary text-sm">Create Request</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="font-medium text-gray-800">{request.title}</h4>
                <p className="text-sm text-gray-500">{formatCurrency(request.amount_needed)} · {request.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  request.status === 'approved' ? 'bg-green-100 text-green-700' :
                  request.status === 'funded' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {request.status}
                </span>
                <Link to={`/student/requests/${request.id}`} className="text-primary-600 hover:text-primary-700">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
