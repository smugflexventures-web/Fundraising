import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    {Icon && <Icon className="w-16 h-16 text-gray-300 mb-4" />}
    <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-400 max-w-md mb-4">{description}</p>}
    {action && action}
  </motion.div>
);

const AlertMessage = ({ type = 'info', title, message, onClose }) => {
  const config = {
    info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    warning: { icon: AlertTriangle, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
    error: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  };

  const { icon: AlertIcon, bg, border, text } = config[type];

  return (
    <div className={`${bg} ${border} border rounded-xl p-4 flex items-start gap-3`}>
      <AlertIcon className={`w-5 h-5 ${text} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        {title && <h4 className={`text-sm font-semibold ${text}`}>{title}</h4>}
        {message && <p className={`text-sm ${text} opacity-80`}>{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      )}
    </div>
  );
};

export { EmptyState, AlertMessage };
