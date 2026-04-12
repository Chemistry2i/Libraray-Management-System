import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes, faBook, faUser, faCog } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K on Mac, Ctrl+K on Windows
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const navigateTo = (path) => {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-32 bg-dark/40 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-airbnb-lg overflow-hidden border border-gray-100"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 border-b border-gray-100">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-lg" />
              <input
                type="text"
                autoFocus
                placeholder="Search books, users, or commands..."
                className="w-full py-5 px-4 text-lg bg-transparent border-none outline-none text-dark placeholder-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-dark transition-colors bg-gray-100 rounded-md text-xs font-bold"
              >
                ESC
              </button>
            </div>

            {/* Quick Actions List (Simulation) */}
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              <p className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                Quick Navigation
              </p>
              <div className="space-y-1">
                <button 
                  onClick={() => navigateTo('/books')}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-light rounded-lg text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <FontAwesomeIcon icon={faBook} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-dark">Browse Catalog</p>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">B</span>
                </button>
                
                <button 
                  onClick={() => navigateTo('/profile')}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-light rounded-lg text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-dark">My Profile</p>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">P</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}