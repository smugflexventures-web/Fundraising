import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, getStatusColor, getCategoryLabel } from '../../utils/helpers';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.requests.getAll(params);
      setRequests(res.data.data || []);
      setTotalPages(res.data.pagination?.total_pages || 1);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Submitted Requests</h1>
        <Link to="/student/requests/new" className="btn-primary text-sm flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Request
        </Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['', 'pending', 'approved', 'rejected', 'funded'].map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === status ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : requests.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No assistance requests on file</h3>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {requests.map((request) => (
              <Link
                key={request.id}
                to={`/student/requests/${request.id}`}
                className="block glass rounded-xl p-4 card-hover"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{request.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {getCategoryLabel(request.category)} · {formatCurrency(request.amount_needed)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(request.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                {request.amount_funded > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Funded: {formatCurrency(request.amount_funded)}</span>
                      <span className="text-gray-400">{Math.round((request.amount_funded / request.amount_needed) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: `${Math.min((request.amount_funded / request.amount_needed) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default StudentRequests;
