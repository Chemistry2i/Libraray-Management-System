const fs = require('fs');

function fixAdminCategories() {
  let code = fs.readFileSync('frontend/src/pages/dashboards/Admin/AdminCategories.jsx', 'utf-8');
  
  code = code.replace(/const \[categories, setCategories\] = useState\(\[\]\);/, 'const [categories, setCategories] = useState([]);\n  const [searchTerm, setSearchTerm] = useState("");\n  const [viewItem, setViewItem] = useState(null);');

  code = code.replace(
    /placeholder="Search categories\.\.\."\s+className="w-full/,
    'placeholder="Search categories..." \n              value={searchTerm}\n              onChange={(e) => setSearchTerm(e.target.value)}\n              className="w-full'
  );

  code = code.replace(/\{categories\.length === 0 \? \(/g, '{filteredCategories.length === 0 ? (');
  code = code.replace(/categories\.map\(\(category\) => \(/g, 'filteredCategories.map((category) => (');

  const derivedStr = `
  const filteredCategories = categories.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (`;
  code = code.replace(/return \(/, derivedStr);

  code = code.replace(/button className="p-1\.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details"/g, 'button onClick={() => setViewItem(category)} className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details"');

  const modalAppend = `
      {/* View Category Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-airbnb-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Category Details</h2>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <p className="text-sm text-gray-500 font-bold mb-1">Category Name</p>
                 <p className="text-gray-900 text-lg font-semibold">{viewItem.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <p className="text-sm text-gray-500 font-bold mb-1">Description</p>
                 <p className="text-gray-700">{viewItem.description || 'No description provided'}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button type="button" onClick={() => setViewItem(null)} className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCategories;
`;
  
  code = code.replace(/<\/div>\s*\);\s*\};\s*export default AdminCategories;/g, modalAppend);
  fs.writeFileSync('frontend/src/pages/dashboards/Admin/AdminCategories.jsx', code);
}

fixAdminCategories();
console.log('Fixed categories');
