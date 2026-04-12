import React from 'react';
import { Download, TrendingUp, Users, BookOpen, DollarSign, FileText } from 'lucide-react';

const AdminReports = () => {
  const reportTypes = [
    { title: 'Monthly Circulation Summary', icon: <BookOpen />, format: 'CSV / PDF', desc: 'Total checkouts, returns, and lost items grouped by category.' },
    { title: 'Patron Engagement', icon: <Users />, format: 'Excel', desc: 'Active members, registration growth, and dormant accounts.' },
    { title: 'Financial Audit (Fines)', icon: <DollarSign />, format: 'PDF', desc: 'Collected fees, outstanding balances, and total waived fines.' },
    { title: 'Top Reservable Inventory', icon: <TrendingUp />, format: 'CSV', desc: 'Most hold-requested books to indicate future purchasing needs.' }
  ];

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Export system performance statistics and generate monthly administrative audits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick KPIs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-primary text-white rounded-xl shadow-md p-6 h-48 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div>
              <p className="text-white/80 text-sm uppercase tracking-widest font-bold">This Month's Checkouts</p>
              <h2 className="text-5xl font-black mt-2">1,204</h2>
            </div>
            <p className="text-sm border-t border-white/20 pt-3"><span className="font-bold text-green-300">↑ 14%</span> vs last month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">New Patrons</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">84</p>
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
              <Users size={28} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Fines Collected</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">$342.50</p>
            </div>
            <div className="p-4 bg-green-50 text-green-600 rounded-full">
              <DollarSign size={28} />
            </div>
          </div>
        </div>

        {/* Reports Hub */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileText size={20} className="text-primary" /> Available Reports</h2>
          </div>
          
          <div className="space-y-4">
            {reportTypes.map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group">
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
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider hidden md:block">{report.format}</span>
                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-2 rounded-lg border border-gray-200 transition-colors flex gap-2 items-center text-sm font-medium">
                    <Download size={16} /> Export
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