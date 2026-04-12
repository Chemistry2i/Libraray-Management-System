import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-9xl font-bold mb-4">404</h1>
        <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
        <p className="text-xl mb-8">The page you're looking for doesn't exist</p>
        <Link
          to="/"
          className="inline-flex items-center btn-primary bg-white text-primary"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
