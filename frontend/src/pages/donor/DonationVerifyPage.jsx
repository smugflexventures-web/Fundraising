import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const DonationVerifyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('ref');
    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found in the URL.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await api.donations.verify({ reference });
        setStatus('success');
        setMessage(res.data.message || 'Your contribution has been processed successfully.');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Payment verification could not be completed. If you were charged, please contact support.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-sm text-gray-500">Please wait while we confirm your contribution...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Contribution Confirmed</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => navigate('/donor/donations')}
              className="btn-primary"
            >
              View Contribution History
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Issue</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => navigate('/donor/donations')}
              className="btn-primary"
            >
              Go to Contributions
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DonationVerifyPage;
