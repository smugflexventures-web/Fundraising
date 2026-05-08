import { useState } from 'react';
import { Download, FileText, BarChart3 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminReports = () => {
  const [reportType, setReportType] = useState('donations');
  const [format, setFormat] = useState('json');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = { type: reportType, format };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      if (format === 'csv') {
        const res = await api.admin.getReports(params);
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV downloaded');
      } else {
        const res = await api.admin.getReports(params);
        setReportData(res.data.data.report);
        toast.success('Report generated');
      }
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field">
              <option value="donations">Donations</option>
              <option value="students">Student Requests</option>
              <option value="campaigns">Campaigns</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-field">
              <option value="json">View Online</option>
              <option value="csv">Export CSV</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
          </div>
        </div>
        <button onClick={generateReport} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? 'Generating...' : (
            <>
              {format === 'csv' ? <Download className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              {format === 'csv' ? 'Export CSV' : 'Generate Report'}
            </>
          )}
        </button>
      </div>

      {reportData && format === 'json' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {reportType === 'donations' ? 'Donations' : reportType === 'students' ? 'Student Requests' : 'Campaigns'} Report
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {reportData.length > 0 && Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-gray-600">{typeof val === 'number' && val > 1000 ? `₦${Number(val).toLocaleString()}` : String(val ?? '-')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
