const fs = require('fs');

function fixAdminUsers() {
  let code = fs.readFileSync('frontend/src/pages/dashboards/Admin/AdminUsers.jsx', 'utf-8');
  
  // Add state
  code = code.replace(/const \[users, setUsers\] = useState\(\[\]\);/, 'const [users, setUsers] = useState([]);\n  const [searchTerm, setSearchTerm] = useState("");\n  const [viewUser, setViewUser] = useState(null);');

  // Input value and onChange
  code = code.replace(
    /placeholder="Search by name, email, or user ID\.\.\."\s+className="w-full/,
    'placeholder="Search by name, email, or user ID..." \n              value={searchTerm}\n              onChange={(e) => setSearchTerm(e.target.value)}\n              className="w-full'
  );

  // Map filtered array
  code = code.replace(/\{users\.length === 0 \? \(/g, '{filteredUsers.length === 0 ? (');
  code = code.replace(/users\.map\(\(user\) => \(/g, 'filteredUsers.map((user) => (');

  // Inject derived state before return
  const derivedStr = `
  const filteredUsers = users.filter(u => 
    (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.user_id && u.user_id.toString().includes(searchTerm))
  );

  return (`;
  code = code.replace(/return \(/, derivedStr);

  // Add view button onClick
  code = code.replace(/button className="p-1\.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View Profile"/g, 'button onClick={() => setViewUser(user)} className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View Profile"');

  // Add modal
  const modalStr = `
        {/* Edit/Create Modal (Existing) */}  
        {isModalOpen && (
          //... existing modal code left untouched because this replace matches below
  `;
  // I will just append to the end before the last closing tags
  
  const modalAppend = `
      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-airbnb-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6 relative">
                 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                    {viewUser.first_name?.charAt(0)}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-gray-900">{viewUser.first_name} {viewUser.last_name}</h3>
                   <p className="text-gray-500">{viewUser.email}</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-4 rounded-xl"><p className="text-sm text-gray-500 mb-1">Role</p><p className="font-semibold capitalize">{viewUser.role}</p></div>
                 <div className="bg-gray-50 p-4 rounded-xl"><p className="text-sm text-gray-500 mb-1">Status</p><p className="font-semibold capitalize">{viewUser.status}</p></div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                 <p className="text-sm text-gray-500 mb-1">Phone</p><p className="font-semibold">{viewUser.phone || 'Not Provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                 <p className="text-sm text-gray-500 mb-1">Joined</p><p className="font-semibold">{new Date(viewUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button type="button" onClick={() => setViewUser(null)} className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminUsers;
`;
  code = code.replace(/<\/div>\s*);\s*};\s*export default AdminUsers;/, modalAppend);
  fs.writeFileSync('frontend/src/pages/dashboards/Admin/AdminUsers.jsx', code);
}

function fixAdminBooks() {
  let code = fs.readFileSync('frontend/src/pages/dashboards/Admin/AdminBooks.jsx', 'utf-8');
  
  code = code.replace(/const \[books, setBooks\] = useState\(\[\]\);/, 'const [books, setBooks] = useState([]);\n  const [searchTerm, setSearchTerm] = useState("");\n  const [viewBook, setViewBook] = useState(null);');

  code = code.replace(
    /placeholder="Search by title, author, or ISBN\.\.\."\s+className="w-full/,
    'placeholder="Search by title, author, or ISBN..." \n              value={searchTerm}\n              onChange={(e) => setSearchTerm(e.target.value)}\n              className="w-full'
  );

  code = code.replace(/\{books\.length === 0 \? \(/g, '{filteredBooks.length === 0 ? (');
  code = code.replace(/books\.map\(\(book\) => \(/g, 'filteredBooks.map((book) => (');

  const derivedStr = `
  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (`;
  code = code.replace(/return \(/, derivedStr);

  code = code.replace(/button className="p-1\.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details"/g, 'button onClick={() => setViewBook(book)} className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details"');

  const modalAppend = `
      {/* View Book Modal */}
      {viewBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-airbnb-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Book Details</h2>
              <button onClick={() => setViewBook(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="col-span-1 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-[300px] border border-gray-200">
                   {viewBook.cover_image_url ? (
                     <img src={viewBook.cover_image_url} alt={viewBook.title} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-gray-400">No Cover Image</span>
                   )}
               </div>
               <div className="col-span-2 space-y-4">
                 <div>
                   <h3 className="text-2xl font-bold text-gray-900">{viewBook.title}</h3>
                   <p className="text-lg text-primary font-medium">{viewBook.author}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-4 rounded-xl"><p className="text-sm text-gray-500 mb-1">ISBN</p><p className="font-semibold">{viewBook.isbn || 'N/A'}</p></div>
                   <div className="bg-gray-50 p-4 rounded-xl"><p className="text-sm text-gray-500 mb-1">Publisher</p><p className="font-semibold">{viewBook.publisher || 'N/A'}</p></div>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-xl"><p className="text-sm text-gray-500 mb-1">Description</p><p className="text-sm text-gray-700 leading-relaxed">{viewBook.description || 'No description provided.'}</p></div>
                 <div className="grid grid-cols-3 gap-3">
                   <div className="bg-gray-50 p-3 rounded-xl text-center"><p className="text-xs text-gray-500 mb-1">Total</p><p className="font-bold text-lg">{viewBook.total_copies}</p></div>
                   <div className="bg-gray-50 p-3 rounded-xl text-center"><p className="text-xs text-gray-500 mb-1">Available</p><p className="font-bold text-lg text-green-600">{viewBook.available_copies}</p></div>
                   <div className="bg-gray-50 p-3 rounded-xl text-center"><p className="text-xs text-gray-500 mb-1">Year</p><p className="font-bold text-lg">{viewBook.published_year || 'N/A'}</p></div>
                 </div>
               </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button type="button" onClick={() => setViewBook(null)} className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminBooks;
`;
  code = code.replace(/<\/div>\s*);\s*};\s*export default AdminBooks;/, modalAppend);
  fs.writeFileSync('frontend/src/pages/dashboards/Admin/AdminBooks.jsx', code);
}

fixAdminUsers();
fixAdminBooks();
console.log('Fixed users and books');
