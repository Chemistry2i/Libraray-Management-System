import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bookAPI } from '../api/endpoints'

const OPEN_SEARCH_EVENT = 'open-global-search'

export function openGlobalSearch(query = '') {
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT, { detail: { query } }))
}

const publicActions = [
  { label: 'Browse Catalog', description: 'Explore all books', path: '/books' },
  { label: 'Digital Archive', description: 'Browse digital collections', path: '/digital-collections' },
]

const userActions = [
  { label: 'My Dashboard', description: 'View your library overview', path: '/user' },
  { label: 'My Borrowings', description: 'View borrowed books', path: '/user/my-books' },
  { label: 'My Reservations', description: 'View your reservations', path: '/user/reservations' },
  { label: 'My Profile', description: 'Manage your account', path: '/user/profile' },
]

const adminActions = [
  { label: 'Admin Dashboard', description: 'View library overview', path: '/admin' },
  { label: 'Manage Books', description: 'Open books and inventory', path: '/admin/books' },
  { label: 'Manage Patrons', description: 'Open patrons and users', path: '/admin/users' },
  { label: 'Manage Borrowing', description: 'Open borrowing management', path: '/admin/borrowing' },
  { label: 'Manage Reservations', description: 'Open holds and reservations', path: '/admin/reservations' },
  { label: 'Review Moderation', description: 'Manage book reviews', path: '/admin/reviews' },
]

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen((open) => !open)
      }
      if (event.key === 'Escape') setIsOpen(false)
    }
    const handleOpen = (event) => {
      setSearch(event.detail?.query || '')
      setError('')
      setIsOpen(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener(OPEN_SEARCH_EVENT, handleOpen)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener(OPEN_SEARCH_EVENT, handleOpen)
    }
  }, [])

  useEffect(() => {
    const query = search.trim()
    const currentRequest = ++requestId.current

    if (query.length < 2) {
      setBooks([])
      setLoading(false)
      setError('')
      return undefined
    }

    setLoading(true)
    setError('')
    const timeout = window.setTimeout(async () => {
      try {
        const response = await bookAPI.search(query)
        if (requestId.current === currentRequest) {
          const results = response.data?.data?.books
          setBooks(Array.isArray(results) ? results : [])
        }
      } catch {
        if (requestId.current === currentRequest) {
          setBooks([])
          setError('Could not search the catalog. Please try again.')
        }
      } finally {
        if (requestId.current === currentRequest) setLoading(false)
      }
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [search])

  const actions = [
    ...publicActions,
    ...(user?.role === 'admin' || user?.role === 'librarian' ? adminActions : []),
    ...(user ? userActions : []),
  ]
  const filteredActions = actions.filter((action) =>
    `${action.label} ${action.description}`.toLowerCase().includes(search.trim().toLowerCase())
  )

  const navigateTo = (path) => {
    setIsOpen(false)
    setSearch('')
    navigate(path)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-dark/40 p-4 pt-24 backdrop-blur-sm sm:pt-32"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-airbnb-lg"
          >
            <div className="flex items-center border-b border-gray-100 px-4">
              <Search className="shrink-0 text-gray-400" size={20} />
              <input
                type="text"
                autoFocus
                placeholder="Search books or pages..."
                aria-label="Search books or pages"
                className="w-full border-none bg-transparent px-4 py-5 text-lg text-dark outline-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500 hover:text-dark"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {search.trim().length < 2 && (
                <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                  Quick Navigation
                </p>
              )}
              {filteredActions.map((action) => (
                <button
                  key={action.path}
                  type="button"
                  onClick={() => navigateTo(action.path)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-light"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Search size={16} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-dark">{action.label}</span>
                    <span className="block text-xs text-gray-500">{action.description}</span>
                  </span>
                </button>
              ))}

              {search.trim().length >= 2 && (
                <div className="mt-2 border-t border-gray-100 pt-2">
                  <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Books
                  </p>
                  {loading && <p className="px-3 py-4 text-sm text-gray-500">Searching the catalog...</p>}
                  {error && <p role="alert" className="px-3 py-4 text-sm text-red-600">{error}</p>}
                  {!loading && !error && books.length === 0 && (
                    <p className="px-3 py-4 text-sm text-gray-500">No matching books found.</p>
                  )}
                  {books.map((book) => (
                    <button
                      key={book.book_id}
                      type="button"
                      onClick={() => navigateTo(`/books/${book.book_id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-light"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BookOpen size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-dark">{book.title}</span>
                        <span className="block truncate text-xs text-gray-500">{book.author || 'Unknown author'}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
