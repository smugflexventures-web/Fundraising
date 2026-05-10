import { useState, useEffect } from 'react';
import { DollarSign, Download, CheckCircle, XCircle, Eye, Clock, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending_transfer'
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (activeTab === 'all') fetchDonations();
    else fetchPendingTransfers();
  }, [page, pendingPage, activeTab]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await api.donations.getAll({ page, per_page: 10 });
      setDonations(res.data.data || []);
      setTotalPages(res.data.pagination?.total_pages || 1);
    } catch {} finally {
      setLoading(false);
    }
  };

  const fetchPendingTransfers = async () => {
    setPendingLoading(true);
    try {
      const res = await api.bankTransfer.getPending({ page: pendingPage, per_page: 10 });
      setPendingTransfers(res.data.data || []);
      setPendingTotalPages(res.data.pagination?.total_pages || 1);
    } catch {} finally {
      setPendingLoading(false);
    }
  };

  const handleVerify = async (id) => {
    setActionLoading(id);
    try {
      await api.bankTransfer.verify(id);
      toast.success('Bank transfer verified and contribution recorded');
      fetchPendingTransfers();
      fetchDonations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.id) return;
    setActionLoading(rejectModal.id);
    try {
      await api.bankTransfer.reject(rejectModal.id, { reason: rejectReason || 'Verification failed' });
      toast.success('Bank transfer rejected');
      setRejectModal({ open: false, id: null });
      setRejectReason('');
      fetchPendingTransfers();
      fetchDonations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Contribution Records</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Contributions
        </button>
        <button
          onClick={() => setActiveTab('pending_transfer')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'pending_transfer' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pending Transfers
        </button>
      </div>

      {activeTab === 'all' ? (
        loading ? <LoadingSpinner /> : (
          <>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Donor</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Campaign</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Reference</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr key={donation.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {donation.is_anonymous ? 'Anonymous' : `${donation.donor_first_name} ${donation.donor_last_name}`}
                            </p>
                            <p className="text-xs text-gray-500">{donation.donor_email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{donation.campaign_title || 'General'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-accent-600">{formatCurrency(donation.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            donation.payment_method === 'bank_transfer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {donation.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Paystack'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                            {donation.status === 'pending_verification' ? 'Pending Verification' : donation.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{donation.reference}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(donation.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )
      ) : pendingLoading ? <LoadingSpinner /> : (
          <>
            {pendingTransfers.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600">No pending bank transfers to verify</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTransfers.map((donation) => (
                  <div key={donation.id} className="glass rounded-2xl p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-medium text-amber-600">Awaiting Verification</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Donor:</span>
                            <span className="ml-2 font-medium text-gray-800">
                              {donation.is_anonymous ? 'Anonymous' : `${donation.donor_first_name} ${donation.donor_last_name}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Amount:</span>
                            <span className="ml-2 font-semibold text-accent-600">{formatCurrency(donation.amount)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Campaign:</span>
                            <span className="ml-2 text-gray-800">{donation.campaign_title || 'General'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Reference:</span>
                            <span className="ml-2 font-mono text-xs text-gray-600">{donation.reference}</span>
                          </div>
                        </div>

                        {donation.proof_transaction_ref && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-blue-700 mb-1">Proof Details</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div><span className="text-gray-500">Transaction Ref:</span> <span className="font-mono">{donation.proof_transaction_ref}</span></div>
                              <div><span className="text-gray-500">Bank:</span> {donation.proof_bank_name || 'N/A'}</div>
                              {donation.proof_notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> {donation.proof_notes}</div>}
                            </div>
                            {donation.proof_file_path && (
                              <a href={`/api/${donation.proof_file_path}`} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800">
                                <Eye className="w-3 h-3" /> View Proof Document
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 md:flex-col md:justify-center">
                        <button
                          onClick={() => handleVerify(donation.id)}
                          disabled={actionLoading === donation.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          {actionLoading === donation.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, id: donation.id })}
                          disabled={actionLoading === donation.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <Pagination currentPage={pendingPage} totalPages={pendingTotalPages} onPageChange={setPendingPage} />
              </div>
            )}
          </>
        )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Reject Bank Transfer</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this transfer. The donor will be notified.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input-field min-h-[80px] mb-4"
              placeholder="Reason for rejection..."
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setRejectModal({ open: false, id: null }); setRejectReason(''); }}
                className="btn-secondary">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading === rejectModal.id}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {actionLoading === rejectModal.id ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;
