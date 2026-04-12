export default function AdminFooter() {
  return (
    <footer className="mt-8 py-6 border-t border-gray-200 bg-white">
      <div className="flex flex-col md:flex-row items-center justify-between px-8 text-sm text-gray-500 font-medium">
        <p>&copy; {new Date().getFullYear()} Blis Enterprise Library Management.</p>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">Support Ticket</a>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Systems Operational
          </span>
        </div>
      </div>
    </footer>
  )
}