import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faQuestion } from '@fortawesome/free-solid-svg-icons'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Icon */}
        <div className="mb-6 flex justify-center">
          <FontAwesomeIcon icon={faQuestion} className="text-9xl text-primary opacity-1" />
        </div>
        
        <h1 className="text-9xl font-bold mb-4 text-gray-900">404</h1>
        <h2 className="text-4xl font-bold mb-4 text-gray-900">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist</p>
        <Link
          to="/"
          className="inline-flex items-center btn-primary bg-primary text-white hover:bg-primary/90"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
