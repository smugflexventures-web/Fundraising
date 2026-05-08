import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { formatDateTime } from '../utils/helpers';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const typeColors = {
  info: 'bg-blue-50 text-blue-600',
  success: 'bg-green-50 text-green-600',
  warning: 'bg-yellow-50 text-yellow-600',
  error: 'bg-red-50 text-red-600',
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.getAll({ page, per_page: 10 });
      setNotifications(res.data.data || []);
      setTotalPages(res.data.pagination?.total_pages || 1);
    } catch {} finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? {...n, is_read: true} : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(notifications.map(n => ({...n, is_read: true})));
      toast.success('All notifications marked as read');
    } catch {}
  };

  const deleteNotification = async (id) => {
    try {
      await api.notifications.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> Mark All Read
        </button>
      </div>

      {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No notifications at this time</h3>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Info;
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl p-4 shadow-sm flex items-start gap-3 transition-all ${
                    !notification.is_read ? 'border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[notification.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(notification.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.is_read && (
                      <button onClick={() => markAsRead(notification.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" title="Mark as read">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(notification.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
