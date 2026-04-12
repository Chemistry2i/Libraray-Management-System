const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/dashboards/Admin/AdminBorrowing.jsx', 'utf-8');
code = code.replace(/<\/div>\s*\);\s*\};\s*export default AdminBorrowing;/g, "</div>\n  );\n};\nexport default AdminBorrowing;");
