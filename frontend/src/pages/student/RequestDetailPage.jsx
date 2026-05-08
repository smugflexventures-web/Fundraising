import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, getStatusColor, getCategoryLabel, getPriorityColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await api.requests.getById(id);
      setRequest(res.data.data.request);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return <div className="text-center py-12"><h2>Request not found</h2></div>;

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    funded: DollarSign,
  };
  const StatusIcon = statusIcons[request.status] || Clock;

  return (
    <div>
      <Link to="/student/requests" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Requests
      </Link>

      <div className="max-w-3xl">
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{request.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                  {request.priority} priority
                </span>
                <span className="text-xs text-gray-400">{getCategoryLabel(request.category)}</span>
              </div>
            </div>
            <StatusIcon className={`w-8 h-8 ${
              request.status === 'approved' || request.status === 'funded' ? 'text-green-500' :
              request.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
            }`} />
          </div>

          <p className="text-gray-600 whitespace-pre-wrap mb-6">{request.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Amount Needed</p>
              <p className="text-sm font-semibold text-gray-800">{formatCurrency(request.amount_needed)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Amount Funded</p>
              <p className="text-sm font-semibold text-accent-600">{formatCurrency(request.amount_funded)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Submitted</p>
              <p className="text-sm font-semibold text-gray-800">{formatDate(request.created_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Progress</p>
              <p className="text-sm font-semibold text-primary-600">
                {request.amount_needed > 0 ? Math.round((request.amount_funded / request.amount_needed) * 100) : 0}%
              </p>
            </div>
          </div>

          {request.amount_funded > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-accent-400 to-accent-600 h-2 rounded-full"
                  style={{ width: `${Math.min((request.amount_funded / request.amount_needed) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {request.admin_notes && (
            <div className="mt-4 bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-medium text-blue-700 mb-1">Admin Notes</p>
              <p className="text-sm text-blue-600">{request.admin_notes}</p>
            </div>
          )}
        </div>

        {/* Documents */}
        {request.documents && request.documents.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Supporting Documents</h2>
            <div className="space-y-2">
              {request.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-700 flex-1">{doc.file_name}</span>
                  <span className="text-xs text-gray-400">{(doc.file_size / 1024).toFixed(1)}KB</span>
                  <a href={`/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetailPage;
