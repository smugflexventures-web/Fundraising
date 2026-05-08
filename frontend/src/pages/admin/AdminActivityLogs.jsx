import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import api from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getActivityLogs({ page, per_page: 20 });
      setLogs(res.data.data || []);
      setTotalPages(res.data.pagination?.total_pages || 1);
    } catch {} finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('delete')) return 'text-red-600 bg-red-50';
    if (action.includes('create')) return 'text-green-600 bg-green-50';
    if (action.includes('update')) return 'text-blue-600 bg-blue-50';
    if (action.includes('login')) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Activity Logs</h1>

      {loading ? <LoadingSpinner /> : logs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No activity logs</h3>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(log.created_at)}</span>
                  </div>
                  {log.description && <p className="text-sm text-gray-600">{log.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {log.first_name && <span>User: {log.first_name} {log.last_name}</span>}
                    {log.ip_address && <span>IP: {log.ip_address}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminActivityLogs;
