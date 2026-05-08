import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Target } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, calculateProgress, getCategoryLabel, getStatusColor } from '../../utils/helpers';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', short_description: '', target_amount: '',
    category: 'general', status: 'active', start_date: '', end_date: '', is_featured: false,
  });

  useEffect(() => {
    fetchCampaigns();
  }, [page]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.campaigns.getAll({ page, per_page: 10, status: '' });
      setCampaigns(res.data.data || []);
      setTotalPages(res.data.pagination?.total_pages || 1);
    } catch {} finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCampaign(null);
    setFormData({ title: '', description: '', short_description: '', target_amount: '', category: 'general', status: 'active', start_date: '', end_date: '', is_featured: false });
    setShowModal(true);
  };

  const openEditModal = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      short_description: campaign.short_description || '',
      target_amount: campaign.target_amount,
      category: campaign.category,
      status: campaign.status,
      start_date: campaign.start_date || '',
      end_date: campaign.end_date || '',
      is_featured: campaign.is_featured,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (e.target.image?.files[0]) {
        data.append('image', e.target.image.files[0]);
      }

      if (editingCampaign) {
        await api.campaigns.updateWithImage(editingCampaign.id, data);
        toast.success('Campaign updated');
      } else {
        await api.campaigns.create(data);
        toast.success('Campaign created');
      }
      setShowModal(false);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Campaign could not be saved at this time');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('This campaign will be permanently removed. Continue?')) return;
    try {
      await api.campaigns.delete(id);
      toast.success('Campaign removed');
      fetchCampaigns();
    } catch {
      toast.error('Campaign could not be removed at this time');
    }
  };

  const categories = ['tuition', 'housing', 'medical', 'feeding', 'books', 'emergency', 'general'];
  const statuses = ['draft', 'active', 'paused', 'completed', 'closed'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Campaign Administration</h1>
        <button onClick={openCreateModal} className="btn-primary text-sm flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {campaign.image ? (
                    <img src={`/${campaign.image}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Target className="w-6 h-6 text-white/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800 truncate">{campaign.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    {campaign.is_featured && <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Featured</span>}
                  </div>
                  <p className="text-sm text-gray-500">{getCategoryLabel(campaign.category)}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="text-accent-600 font-semibold">{formatCurrency(campaign.raised_amount)}</span>
                    <span className="text-gray-400">of {formatCurrency(campaign.target_amount)}</span>
                    <span className="text-gray-400">{calculateProgress(campaign.raised_amount, campaign.target_amount)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditModal(campaign)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(campaign.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <input name="short_description" value={formData.short_description} onChange={(e) => setFormData({...formData, short_description: e.target.value})} className="input-field" maxLength={500} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-field min-h-[100px]" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₦) *</label>
              <input type="number" name="target_amount" value={formData.target_amount} onChange={(e) => setFormData({...formData, target_amount: e.target.value})} className="input-field" min="1000" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-field">
                {categories.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="input-field">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Image</label>
            <input type="file" name="image" accept="image/*" className="input-field" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="is_featured" className="text-sm text-gray-700">Featured Campaign</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editingCampaign ? 'Update Campaign' : 'Create Campaign'}</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCampaigns;
