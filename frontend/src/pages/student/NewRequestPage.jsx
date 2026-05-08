import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const categories = [
  { value: 'tuition', label: 'Tuition Fees' },
  { value: 'housing', label: 'Housing' },
  { value: 'medical', label: 'Medical' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'books', label: 'Books & Materials' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const NewRequestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount_needed: '',
    category: 'tuition',
    priority: 'medium',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const validFiles = selected.filter(
      (f) =>
        ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(f.type) &&
        f.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== selected.length) {
      toast.warning('Some files were excluded due to unsupported format or size exceeding 5MB');
    }
    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('amount_needed', formData.amount_needed);
      data.append('category', formData.category);
      data.append('priority', formData.priority);

      files.forEach((file, i) => {
        data.append(`documents[${i}]`, file);
      });

      const res = await api.requests.create(data);
      toast.success('Assistance request submitted');
      navigate(`/student/requests/${res.data.data.request.id}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.response?.data?.message || 'The request could not be submitted at this time');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Submit Assistance Request</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Brief title describing your need"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field min-h-[120px]"
              placeholder="Describe your circumstances and the assistance required (minimum 20 characters)"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Needed (₦) *</label>
              <input
                type="number"
                name="amount_needed"
                value={formData.amount_needed}
                onChange={handleChange}
                className="input-field"
                placeholder="100000"
                min="1000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="input-field">
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Supporting Documents</label>
          <p className="text-xs text-gray-400 mb-3">Upload PDF, JPG, or PNG files (max 5MB each)</p>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click or drag files here</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ position: 'relative' }}
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)}KB</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          <button type="button" onClick={() => navigate('/student/requests')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewRequestPage;
