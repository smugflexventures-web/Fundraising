import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, DollarSign, Eye } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, getStatusColor, getCategoryLabel, getPriorityColor } from '../../utils/helpers';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

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

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.requests.updateStatus(id, { status, notes: adminNotes });
      toast.success(`Request ${status}`);
      setShowModal(false);
      setAdminNotes('');
      fetchRequests();
    } catch {
      toast.error('Failed to update request status');
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setShowModal(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Request Management</h1>

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

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl p-4 shadow-sm flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800 truncate">{request.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {request.first_name} {request.last_name} · {request.student_id || 'N/A'} · {request.department || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {getCategoryLabel(request.category)} · {formatCurrency(request.amount_needed)}
                    {request.amount_funded > 0 && ` · Funded: ${formatCurrency(request.amount_funded)}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(request.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(request)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Review">
                    <Eye className="w-4 h-4" />
                  </button>
                  {request.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(request.id, 'approved')} className="p-2 rounded-lg hover:bg-green-50 text-green-600" title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStatusUpdate(request.id, 'rejected')} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Review Request" size="lg">
        {selectedRequest && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{selectedRequest.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                  {selectedRequest.priority}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600"><strong>Student:</strong> {selectedRequest.first_name} {selectedRequest.last_name}</p>
              <p className="text-sm text-gray-600"><strong>Student ID:</strong> {selectedRequest.student_id || 'N/A'}</p>
              <p className="text-sm text-gray-600"><strong>Department:</strong> {selectedRequest.department || 'N/A'}</p>
              <p className="text-sm text-gray-600"><strong>Category:</strong> {getCategoryLabel(selectedRequest.category)}</p>
              <p className="text-sm text-gray-600"><strong>Amount Needed:</strong> {formatCurrency(selectedRequest.amount_needed)}</p>
              <p className="text-sm text-gray-600"><strong>Amount Funded:</strong> {formatCurrency(selectedRequest.amount_funded)}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRequest.description}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Add notes about this decision..."
              />
            </div>

            <div className="flex gap-3">
              {selectedRequest.status === 'pending' && (
                <>
                  <button onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')} className="btn-accent flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')} className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              )}
              {selectedRequest.status === 'approved' && (
                <button onClick={() => handleStatusUpdate(selectedRequest.id, 'funded')} className="btn-primary flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Mark as Funded
                </button>
              )}
              <button onClick={() => setShowModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminRequests;
