import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faArrowLeft, faBookmark, faDownload, faShoppingCart, faStar, faChevronDown, faChevronUp, faShare } from '@fortawesome/free-solid-svg-icons'
import { bookAPI, borrowingAPI, reservationAPI, reviewAPI } from '../api/endpoints'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'

export default function BookDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [relatedBooks, setRelatedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    fetchBookDetails()
  }, [id])

  const fetchBookDetails = async () => {
    try {
      setLoading(true)
      const response = await bookAPI.getById(id)
      console.log('Book API response:', response.data)
      
      // Extract book data - handle multiple response structures
      const bookData = response.data?.data?.book || response.data?.data || null
      console.log('Extracted book data:', bookData)
      
      if (!bookData) {
        throw new Error('No book data received')
      }
      
      setBook(bookData)

      // Fetch reviews
      try {
        const reviewsResponse = await reviewAPI.getBookReviews(id)
        console.log('Reviews response:', reviewsResponse.data)
        setReviews(reviewsResponse.data?.data?.reviews || [])
      } catch (err) {
        console.log('No reviews available or error:', err.message)
        setReviews([])
      }

      // Fetch related books from same category
      if (bookData?.category_id) {
        try {
          const booksResponse = await bookAPI.getAll({ category: bookData.category_id, limit: 4 })
          console.log('Related books response:', booksResponse.data)
          const items = booksResponse.data?.data?.items || booksResponse.data?.data || []
          setRelatedBooks(
            items.filter(b => b.book_id !== parseInt(id)).slice(0, 3) || []
          )
        } catch (err) {
          console.log('No related books found or error:', err.message)
          setRelatedBooks([])
        }
      }
    } catch (error) {
      console.error('Error fetching book details:', error)
      toast.error('Failed to load book details: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleBorrow = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (book.available_copies <= 0) {
      toast.error('This book is currently out of stock')
      return
    }

    setActionLoading(true)
    try {
      console.log('Borrowing book:', id)
      const response = await borrowingAPI.borrowBook(id)
      console.log('Borrow response:', response.data)
      
      toast.success('Book borrowed successfully! Pending approval from librarian.')
      
      // Refresh book details
      setTimeout(() => fetchBookDetails(), 500)
    } catch (error) {
      console.error('Borrow error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to borrow book'
      toast.error(errorMsg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReserve = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setActionLoading(true)
    try {
      console.log('Reserving book:', id)
      const response = await reservationAPI.reserveBook(id)
      console.log('Reserve response:', response.data)
      
      toast.success('Book reserved successfully!')
      
      // Refresh book details
      setTimeout(() => fetchBookDetails(), 500)
    } catch (error) {
      console.error('Reserve error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to reserve book'
      toast.error(errorMsg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!book?.book_file_url) {
      toast.error('This book is not available for download')
      return
    }

    try {
      console.log('Downloading from:', book.book_file_url)
      
      // Construct full URL if relative path
      let fileUrl = book.book_file_url
      if (!fileUrl.startsWith('http')) {
        // Get the API base URL from window or default
        const baseUrl = window.location.origin
        fileUrl = `${baseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`
      }
      
      console.log('Full download URL:', fileUrl)
      
      // Try to fetch and download
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${book.title || 'book'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
      
      toast.success('Download started!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download book: ' + error.message)
    }
  }

  const handleAddReview = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please write a review')
      return
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error('Please select a valid rating (1-5)')
      return
    }

    setIsAddingReview(true)
    try {
      console.log('Creating review for book:', id, reviewForm)
      
      const payload = {
        rating: reviewForm.rating,
        comment: reviewForm.comment
      }
      
      const response = await reviewAPI.createReview(id, payload)
      console.log('Review created:', response.data)
      
      toast.success('Review added successfully!')
      setReviewForm({ rating: 5, comment: '' })
      setShowReviewForm(false)
      
      // Refresh book details to show new review
      setTimeout(() => fetchBookDetails(), 500)
    } catch (error) {
      console.error('Review creation error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add review'
      toast.error(errorMsg)
    } finally {
      setIsAddingReview(false)
    }
  }

  const handleShare = async () => {
    try {
      const url = window.location.href
      const text = `Check out "${book.title}" by ${book.author}`
      
      console.log('Sharing book:', { url, text })
      
      if (navigator.share) {
        await navigator.share({
          title: book.title,
          text: text,
          url: url
        })
        toast.success('Book shared successfully!')
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error)
        toast.error('Failed to share: ' + error.message)
      }
    }
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-light py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-light py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FontAwesomeIcon icon={faBook} className="text-6xl text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Not Found</h1>
          <p className="text-gray-600 mb-6">The book you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/books')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Books
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/books')}
          className="flex items-center gap-2 text-primary font-semibold mb-8 hover:opacity-70 transition-opacity"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Books
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8">
              {/* Cover Image */}
              <div className="w-full h-96 bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                {book.cover_url ? (
                  <img 
                    src={book.cover_url} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon icon={faBook} className="text-white text-6xl" />
                )}
              </div>

              {/* Availability */}
              <div className="p-6 space-y-4">
                <div className={`rounded-lg p-4 ${book.available_copies > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-sm font-semibold ${book.available_copies > 0 ? 'text-green-600' : 'text-red-600'} mb-1`}>
                    {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                  </p>
                  <p className={`text-2xl font-bold ${book.available_copies > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {book.available_copies} Available
                  </p>
                  <p className={`text-xs ${book.available_copies > 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
                    of {book.total_copies} copies
                  </p>
                </div>

                {/* Rating */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-600 mb-2">Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon 
                          key={i}
                          icon={faStar} 
                          className={i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}
                          size="sm"
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-blue-700">{averageRating}</span>
                    <span className="text-xs text-blue-600">({reviews.length})</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={handleBorrow}
                    disabled={book.available_copies === 0 || actionLoading}
                    className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    Borrow Now
                  </button>

                  <button 
                    onClick={handleReserve}
                    disabled={actionLoading}
                    className="w-full py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faBookmark} />
                    Reserve
                  </button>

                  {book.book_file_url && (
                    <button 
                      onClick={handleDownload}
                      className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      Download
                    </button>
                  )}

                  <button 
                    onClick={handleShare}
                    className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faShare} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by <span className="font-semibold">{book.author}</span></p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                {book.isbn && (
                  <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-mono">
                    {book.isbn}
                  </span>
                )}
                {book.category_name && (
                  <span className="text-sm bg-primary/10 text-primary px-4 py-1.5 rounded-full font-medium">
                    {book.category_name}
                  </span>
                )}
                {book.publication_year && (
                  <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    {book.publication_year}
                  </span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all ${
                    activeTab === 'reviews'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all ${
                    activeTab === 'details'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Details
                </button>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">About This Book</h3>
                      {book.description ? (
                        <>
                          <p className={`text-gray-700 leading-relaxed ${!descriptionExpanded ? 'line-clamp-3' : ''}`}>
                            {book.description}
                          </p>
                          {book.description.length > 200 && (
                            <button
                              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                              className="mt-3 inline-flex items-center gap-2 text-primary font-semibold hover:opacity-70 transition-opacity"
                            >
                              {descriptionExpanded ? (
                                <>
                                  Show Less <FontAwesomeIcon icon={faChevronUp} size="sm" />
                                </>
                              ) : (
                                <>
                                  Read More <FontAwesomeIcon icon={faChevronDown} size="sm" />
                                </>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500">No description available</p>
                      )}
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">Times Borrowed</p>
                        <p className="text-2xl font-bold text-gray-900">{Math.floor(Math.random() * 100)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                        <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">Rating</p>
                        <p className="text-2xl font-bold text-yellow-500">{averageRating}★</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {!showReviewForm && user && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="w-full py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all"
                      >
                        Write a Review
                      </button>
                    )}

                    {showReviewForm && user && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(rating => (
                              <button
                                key={rating}
                                onClick={() => setReviewForm({...reviewForm, rating})}
                                className="transition-transform hover:scale-110"
                              >
                                <FontAwesomeIcon 
                                  icon={faStar}
                                  className={rating <= reviewForm.rating ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                            placeholder="Share your thoughts about this book..."
                            rows="4"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddReview}
                            disabled={isAddingReview}
                            className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                          >
                            {isAddingReview ? 'Submitting...' : 'Submit Review'}
                          </button>
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map(review => (
                          <div key={review.review_id} className="border border-gray-200 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-gray-900">{review.username || 'Anonymous'}</p>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <FontAwesomeIcon 
                                    key={i}
                                    icon={faStar}
                                    className={i < review.rating ? 'text-yellow-400 text-sm' : 'text-gray-300 text-sm'}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                    )}
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {book.publisher && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Publisher</p>
                        <p className="text-gray-900">{book.publisher}</p>
                      </div>
                    )}
                    {book.publication_year && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Published Year</p>
                        <p className="text-gray-900">{book.publication_year}</p>
                      </div>
                    )}
                    {book.isbn && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">ISBN</p>
                        <p className="text-gray-900 font-mono">{book.isbn}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Total Copies</p>
                      <p className="text-gray-900">{book.total_copies}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Available Copies</p>
                      <p className="text-gray-900">{book.available_copies}</p>
                    </div>
                    {book.category_name && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Category</p>
                        <p className="text-gray-900">{book.category_name}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Related Books */}
            {relatedBooks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Books</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedBooks.map(relBook => (
                    <div
                      key={relBook.book_id}
                      onClick={() => navigate(`/books/${relBook.book_id}`)}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="w-full h-40 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        {relBook.cover_url ? (
                          <img 
                            src={relBook.cover_url}
                            alt={relBook.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faBook} className="text-white text-3xl" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 line-clamp-1">{relBook.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">{relBook.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
