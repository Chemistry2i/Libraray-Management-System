import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFilter, faBook } from '@fortawesome/free-solid-svg-icons'
import { bookAPI } from '../api/endpoints'
import { toast } from 'react-toastify'

export default function BooksPage() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [search, selectedCategory])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await bookAPI.getAll({
        search,
        category: selectedCategory
      })
      // Response structure: { data: { items: [...], pagination: {...} } }
      const books = response.data?.data?.items || []
      setBooks(Array.isArray(books) ? books : [])
    } catch (error) {
      console.error('Failed to load books:', error)
      toast.error('Failed to load books')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await bookAPI.getCategories()
      // Response structure: { data: { items: [...], pagination: {...} } }
      const categories = response.data?.data?.items || []
      setCategories(Array.isArray(categories) ? categories : [])
    } catch (error) {
      console.error('Failed to load categories:', error)
      setCategories([])
    }
  }

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-dark mb-4">Browse Books</h1>
          <p className="text-gray-600">Discover your next favorite book</p>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-4 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books, authors..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {Array.isArray(categories) && categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              defaultValue="latest"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner w-12 h-12"></div>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link
                key={book.book_id}
                to={`/books/${book.book_id}`}
                className="bg-white rounded-lg overflow-hidden shadow-airbnb card-hover transition-all"
              >
                <div className="w-full h-64 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <FontAwesomeIcon icon={faBook} className="text-white text-5xl" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-dark mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                    {book.author}
                  </p>
                  <div className="flex items-center mb-4">
                    <span className="text-sm font-medium text-gray-600">
                      {book.available_copies > 0 ? `${book.available_copies} available` : 'Out of stock'}
                    </span>
                  </div>
                  <button className="w-full btn-primary text-sm py-2">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faBook} className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No books found</p>
          </div>
        )}
      </div>
    </div>
  )
}
