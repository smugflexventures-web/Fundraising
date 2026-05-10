import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, CreditCard, Building2, Upload, CheckCircle, Clock, Loader2, Copy } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import { toast } from 'react-toastify';

const DonatePage = () => {
  const { user } = useAuth();
  const { campaignId, requestId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [studentRequest, setStudentRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCampaign, setFetchingCampaign] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [bankDetails, setBankDetails] = useState(null);
  const [bankTransferStep, setBankTransferStep] = useState('form');
  const [bankDonationId, setBankDonationId] = useState(null);
  const [bankReference, setBankReference] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofData, setProofData] = useState({
    bank_name: '',
    account_name: '',
    transaction_reference: '',
    notes: '',
  });
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    is_anonymous: false,
    campaign_id: campaignId || '',
    request_id: requestId || '',
  });

  useEffect(() => {
    if (campaignId) fetchCampaign();
    if (requestId) fetchStudentRequest();
    fetchBankDetails();
  }, [campaignId, requestId]);

  const fetchCampaign = async () => {
    setFetchingCampaign(true);
    try {
      const res = await api.campaigns.getById(campaignId);
      setCampaign(res.data.data.campaign);
      setFormData(prev => ({ ...prev, campaign_id: campaignId }));
    } catch {} finally {
      setFetchingCampaign(false);
    }
  };

  const fetchStudentRequest = async () => {
    setFetchingCampaign(true);
    try {
      const res = await api.requests.getById(requestId);
      setStudentRequest(res.data.data.request);
      setFormData(prev => ({ ...prev, request_id: requestId }));
    } catch {} finally {
      setFetchingCampaign(false);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const res = await api.bankTransfer.getBankDetails();
      setBankDetails(res.data.data);
    } catch {}
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) < 1000) {
      toast.error('Minimum contribution amount is NGN 1,000');
      return;
    }

    setLoading(true);
    try {
      const res = await api.donations.initialize({
        amount: parseFloat(formData.amount),
        campaign_id: formData.campaign_id || null,
        request_id: formData.request_id || null,
        message: formData.message || null,
        is_anonymous: formData.is_anonymous,
      });

      const { authorization_url, reference } = res.data.data;

      toast.info('Redirecting to payment gateway...');

      // For Paystack inline popup approach
      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: res.data.data.public_key,
          email: user?.email || '',
          amount: parseFloat(formData.amount) * 100,
          ref: reference,
          onClose: () => {
            toast.warning('Payment window was closed before completion');
          },
          callback: async (response) => {
            try {
              await api.donations.verify(response.reference);
              toast.success('Contribution processed successfully');
              navigate('/donor/donations');
            } catch {
              toast.error('Payment verification could not be completed');
            }
          },
        });
        handler.openIframe();
      } else {
        // Fallback: redirect to Paystack authorization URL
        window.location.href = authorization_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment could not be initialized at this time');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [5000, 10000, 25000, 50000, 100000];

  const handleBankTransferInit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) < 1000) {
      toast.error('Minimum contribution amount is NGN 1,000');
      return;
    }
    setLoading(true);
    try {
      const res = await api.bankTransfer.initialize({
        amount: parseFloat(formData.amount),
        campaign_id: formData.campaign_id || null,
        request_id: formData.request_id || null,
        message: formData.message || null,
        is_anonymous: formData.is_anonymous,
      });
      setBankDonationId(res.data.data.donation_id);
      setBankReference(res.data.data.reference);
      setBankTransferStep('details');
      toast.success('Transfer initiated. Please complete the bank transfer and upload proof.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate bank transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      toast.error('Please upload proof of payment');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(proofFile.type)) {
      toast.error('Only PDF, JPG, and PNG files are accepted');
      return;
    }
    if (proofFile.size > 5 * 1024 * 1024) {
      toast.error('File size must not exceed 5MB');
      return;
    }
    if (!proofData.transaction_reference.trim()) {
      toast.error('Transaction reference from your bank is required');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('proof', proofFile);
      fd.append('bank_name', proofData.bank_name);
      fd.append('account_name', proofData.account_name);
      fd.append('transaction_reference', proofData.transaction_reference);
      fd.append('notes', proofData.notes);
      await api.bankTransfer.submitProof(bankDonationId, fd);
      setBankTransferStep('submitted');
      toast.success('Proof submitted successfully. Awaiting admin verification.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proof');
    } finally {
      setLoading(false);
    }
  };

  // Bank transfer submitted success view
  if (bankTransferStep === 'submitted') {
    return (
      <div className="max-w-2xl">
        <div className="glass rounded-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Proof Submitted</h2>
          <p className="text-gray-600 mb-4">
            Your proof of payment for <strong>{formatCurrency(formData.amount)}</strong> has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Reference: <span className="font-mono">{bankReference}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            An administrator will verify your transfer. You will be notified once it is confirmed.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/donor/donations')} className="btn-primary">View Contributions</button>
            <button onClick={() => navigate('/donor')} className="btn-secondary">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  // Bank transfer details view (after init, before proof upload)
  if (bankTransferStep === 'details') {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Bank Transfer</h1>
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">Awaiting Transfer</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Please transfer <strong>{formatCurrency(formData.amount)}</strong> to the account below, then upload your proof of payment.
          </p>
          <p className="text-xs text-gray-400 mb-4">Reference: <span className="font-mono">{bankReference}</span></p>
          {bankDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-blue-800 text-sm">Bank Account Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bank</span>
                  <span className="text-sm font-semibold text-gray-800">{bankDetails.bank_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 font-mono">{bankDetails.account_number}</span>
                    <button onClick={() => copyToClipboard(bankDetails.account_number)} className="text-blue-500 hover:text-blue-700">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Name</span>
                  <span className="text-sm font-semibold text-gray-800">{bankDetails.account_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sort Code</span>
                  <span className="text-sm font-semibold text-gray-800 font-mono">{bankDetails.sort_code}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleProofSubmit} className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-gray-800">Upload Proof of Payment</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference *</label>
            <input type="text" value={proofData.transaction_reference}
              onChange={(e) => setProofData({ ...proofData, transaction_reference: e.target.value })}
              className="input-field" placeholder="Enter the reference from your bank receipt" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Bank Name</label>
            <input type="text" value={proofData.bank_name}
              onChange={(e) => setProofData({ ...proofData, bank_name: e.target.value })}
              className="input-field" placeholder="e.g. GTBank, Access Bank" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name Used</label>
            <input type="text" value={proofData.account_name}
              onChange={(e) => setProofData({ ...proofData, account_name: e.target.value })}
              className="input-field" placeholder="Name on the sending account" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proof Document (PDF, JPG, PNG) *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setProofFile(e.target.files[0])}
                className="hidden" id="proof-upload" />
              <label htmlFor="proof-upload" className="cursor-pointer">
                {proofFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">{proofFile.name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload receipt or screenshot</p>
                    <p className="text-xs text-gray-400 mt-1">Max 5MB — PDF, JPG, PNG</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea value={proofData.notes}
              onChange={(e) => setProofData({ ...proofData, notes: e.target.value })}
              className="input-field min-h-[60px]" placeholder="Any additional information about the transfer" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {loading ? 'Submitting...' : 'Submit Proof'}
            </button>
            <button type="button" onClick={() => setBankTransferStep('form')} className="btn-secondary">Back</button>
          </div>
        </form>
      </div>
    );
  }

  // Main form view
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Make a Contribution</h1>

      <div className="max-w-2xl">
        {fetchingCampaign && <Loader2 className="w-6 h-6 animate-spin text-primary-600" />}

        {campaign && (
          <div className="glass rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800">{campaign.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(campaign.raised_amount)} raised of {formatCurrency(campaign.target_amount)}
            </p>
          </div>
        )}

        {studentRequest && (
          <div className="glass rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800">{studentRequest.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(studentRequest.amount_funded)} funded of {formatCurrency(studentRequest.amount_needed)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-accent-400 to-accent-600 h-2 rounded-full"
                style={{ width: `${studentRequest.amount_needed > 0 ? Math.min((studentRequest.amount_funded / studentRequest.amount_needed) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="glass rounded-2xl p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setPaymentMethod('paystack')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === 'paystack' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <CreditCard className={`w-6 h-6 mb-2 ${paymentMethod === 'paystack' ? 'text-primary-600' : 'text-gray-400'}`} />
              <p className={`text-sm font-semibold ${paymentMethod === 'paystack' ? 'text-primary-700' : 'text-gray-700'}`}>Pay Online</p>
              <p className="text-xs text-gray-500 mt-1">Card, Bank, USSD, Mobile</p>
            </button>
            <button type="button" onClick={() => setPaymentMethod('bank_transfer')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === 'bank_transfer' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <Building2 className={`w-6 h-6 mb-2 ${paymentMethod === 'bank_transfer' ? 'text-primary-600' : 'text-gray-400'}`} />
              <p className={`text-sm font-semibold ${paymentMethod === 'bank_transfer' ? 'text-primary-700' : 'text-gray-700'}`}>Bank Transfer</p>
              <p className="text-xs text-gray-500 mt-1">Manual transfer + proof upload</p>
            </button>
          </div>
        </div>

        <form onSubmit={paymentMethod === 'paystack' ? handleSubmit : handleBankTransferInit} className="glass rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Donation Amount (₦) *</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    formData.amount === amount.toString()
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input-field"
              placeholder="Or enter custom amount"
              min="1000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="Leave a message of encouragement"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_anonymous: !formData.is_anonymous })}
              className={`w-10 h-6 rounded-full transition-colors ${
                formData.is_anonymous ? 'bg-primary-600' : 'bg-gray-300'
              } relative`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                formData.is_anonymous ? 'translate-x-4' : ''
              }`} />
            </button>
            <span className="text-sm text-gray-600">Donate anonymously</span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : paymentMethod === 'paystack' ? (
              <>
                <CreditCard className="w-5 h-5" /> Pay {formData.amount ? formatCurrency(formData.amount) : ''} Online
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5" /> Initiate Bank Transfer
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            {paymentMethod === 'paystack'
              ? 'Payments are securely processed via Paystack. Supports card, bank transfer, USSD, and mobile money.'
              : 'You will be shown bank account details to transfer to, then upload proof of payment for admin verification.'
            }
          </p>
        </form>
      </div>
    </div>
  );
};

export default DonatePage;
