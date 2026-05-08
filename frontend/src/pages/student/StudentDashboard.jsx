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
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, funded: 0, total_requested: 0, total_funded: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, requestsRes] = await Promise.all([
          api.requests.getStats(),
          api.requests.getAll({ per_page: 5 }),
        ]);
        setStats(statsRes.data.data || {});
        setRecentRequests(requestsRes.data.data || []);
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
        <h1 className="text-2xl font-bold text-gray-800">Assistance Overview</h1>
        <p className="text-sm text-gray-500">{user?.first_name}, here is your request activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Submitted Requests" value={stats.total} icon={FileText} color="primary" />
        <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="warm" />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="accent" />
        <StatCard title="Disbursed Funds" value={formatCurrency(stats.total_funded)} icon={DollarSign} color="purple" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Submissions</h2>
        <Link to="/student/requests/new" className="btn-primary text-sm flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Request
        </Link>
      </div>

      {recentRequests.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No requests submitted</h3>
          <p className="text-sm text-gray-400 mb-4">Begin by submitting an assistance request</p>
          <Link to="/student/requests/new" className="btn-primary text-sm">Submit Request</Link>
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
