import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className={`${sizeClasses[size]} text-primary animate-spin`}>
        <FontAwesomeIcon icon={faSpinner} className="text-3xl" />
      </div>
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  )
}
