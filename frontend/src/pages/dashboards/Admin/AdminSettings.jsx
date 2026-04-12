import React from 'react';
import { Save, Bell, Shield, Library, CreditCard } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="py-2 w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 mt-1">Configure global library policies, borrowing rules, and notifications.</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
        
        {/* Section 1: Library Details */}
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Library size={20} className="text-gray-500" /> Library Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Library Name</label>
              <input type="text" defaultValue="Blis Regional Library" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Support Email</label>
              <input type="email" defaultValue="support@blislibrary.edu" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Welcome Message / Announcement</label>
              <textarea rows="2" defaultValue="Welcome to Blis. Overdue fines currently waived until Nov 1st due to system upgrades." className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"></textarea>
            </div>
          </div>
        </div>

        {/* Section 2: Circulation Rules */}
        <div className="p-6 md:p-8 bg-gray-50/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Shield size={20} className="text-indigo-500" /> Borrowing Rules</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Books per Patron</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-white">
                <option>3 Books</option>
                <option selected>5 Books</option>
                <option>10 Books</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Standard Loan Period (Days)</label>
              <input type="number" defaultValue="14" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Renewals Allowed</label>
              <input type="number" defaultValue="2" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>
        </div>

        {/* Section 3: Fine Policies */}
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CreditCard size={20} className="text-green-500" /> Fines & Penalties</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 items-center">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Daily Overdue Fine ($)</label>
              <input type="number" step="0.10" defaultValue="0.50" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Fine Cap per Book ($)</label>
              <input type="number" defaultValue="20.00" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="flex flex-col mt-5">
              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 p-3 rounded-lg hover:border-gray-300 transition-all">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded ring-0 outline-none" />
                <span className="text-sm font-semibold text-gray-700">Suspend if unpaid</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Notifications */}
        <div className="p-6 md:p-8 bg-gray-50/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Bell size={20} className="text-yellow-500" /> Automation & Alerts</h2>
          </div>
          <div className="space-y-4 mt-6 max-w-2xl">
            <label className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer">
              <div>
                <p className="font-bold text-gray-900 text-sm">Due Date Reminder Emails</p>
                <p className="text-xs text-gray-500 mt-0.5">Send a reminder 3 days before a book is due</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer">
              <div>
                <p className="font-bold text-gray-900 text-sm">Reservation Available Alerts</p>
                <p className="text-xs text-gray-500 mt-0.5">Notify the next patron automatically when their hold is returned</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;