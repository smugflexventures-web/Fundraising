import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Trash2, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { formatDate, getStatusColor } from '../../utils/helpers';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await api.admin.getUsers(params);
      setUsers(res.data.data || []);
      setTotalPages(res.data.pagination?.total_pages || 1);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleVerify = async (id) => {
    try {
      await api.admin.verifyUser(id);
      toast.success('Account verification confirmed');
      fetchUsers();
    } catch {
      toast.error('Verification could not be completed at this time');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.admin.toggleUserStatus(id);
      toast.success('User status updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('This account will be permanently removed. Are you sure?')) return;
    try {
      await api.admin.deleteUser(id);
      toast.success('Account removed');
      fetchUsers();
    } catch {
      toast.error('Account could not be removed at this time');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Management</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
              placeholder="Search by name, email, or student ID..."
            />
          </div>
          <button type="submit" className="btn-primary text-sm">Find</button>
        </form>
        <div className="flex gap-2">
          {['', 'student', 'donor', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                roleFilter === role ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              {role || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Student ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Verified</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'student' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.student_id || '-'}</td>
                      <td className="px-4 py-3">
                        {user.is_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!user.is_verified && (
                            <button onClick={() => handleVerify(user.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Verify">
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleToggleStatus(user.id)} className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600" title="Toggle Status">
                            {user.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminUsers;
