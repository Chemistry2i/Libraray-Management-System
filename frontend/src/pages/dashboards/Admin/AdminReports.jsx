import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Users, BookOpen, DollarSign, FileText, Loader2 } from 'lucide-react';
import api from '../../../api/axios';
import Swal from 'sweetalert2';

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/report');
        setReportData(res.data.data?.report);
      } catch (error) {
        console.error('Failed to fetch comprehensive report', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load report data',
          customClass: { popup: 'rounded-[4px]' }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleExport = (reportType, dataToExport) => {
    if (!dataToExport) {
      Swal.fire({ icon: 'warning', title: 'Empty Data', text: 'No data available to export.', customClass: { popup: 'rounded-[4px] z-[9999]' }});
      return;
    }
    
    // Create a simple JSON export for now
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    Swal.fire({
      icon: 'success',
      title: 'Export Successful',
      text: `${reportType} has been downloaded.`,
      timer: 2000,
      showConfirmButton: false,
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    });
  };

  const reportTypes = [
    { title: 'Monthly Circulation Summary', icon: <BookOpen />, format: 'JSON', desc: 'Total checkouts, returns, and category stats.', targetData: reportData?.categoryStats },
    { title: 'Patron Engagement', icon: <Users />, format: 'JSON', desc: 'Active members, registration growth, and dormant accounts.', targetData: reportData?.memberStats },
    { title: 'Overdue & Fines Report', icon: <DollarSign />, format: 'JSON', desc: 'Collected fees, outstanding balances, and total waived fines.', targetData: reportData?.overdue },
    { title: 'Top Reservable Inventory', icon: <TrendingUp />, format: 'JSON', desc: 'Most hold-requested books to indicate future purchasing needs.', targetData: reportData?.mostBorrowed }
  ];

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Compiling Reports...</p>
        </div>
      </div>
    );
  }

  const { overview } = reportData || {};

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Export system performance statistics and generate administrative audits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick KPIs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-primary text-white rounded-xl shadow-md p-6 h-48 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div>
              <p className="text-white/80 text-sm uppercase tracking-widest font-bold">Active Borrows</p>
              <h2 className="text-5xl font-black mt-2">{overview?.active_borrows || 0}</h2>
            </div>
            <p className="text-sm border-t border-white/20 pt-3">
              <span className="font-bold text-blue-200">Across {overview?.total_users || 0} Users</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.total_members || 0}</p>
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
              <Users size={28} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Fines Collected</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${Number(overview?.total_fines_collected || 0).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-green-50 text-green-600 rounded-full">
              <DollarSign size={28} />
            </div>
          </div>
        </div>

        {/* Reports Hub */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText size={20} className="text-primary" /> 
              Available Reports Dataset
            </h2>
            <p className="text-sm text-gray-500 mt-1">Generated {new Date(reportData?.generatedAt || new Date()).toLocaleString()}</p>
          </div>
          
          <div className="space-y-4">
            {reportTypes.map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-[4px] hover:border-gray-300 hover:shadow-sm transition-all group">
                <div className="flex gap-4">
                  <div className="p-3 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {report.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{report.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">{report.desc}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider hidden md:block">{report.format} Export</span>
                  <button 
                    onClick={() => handleExport(report.title, report.targetData)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-2 rounded-[4px] border border-gray-200 transition-colors flex gap-2 items-center text-sm font-medium">
                    <Download size={16} /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
