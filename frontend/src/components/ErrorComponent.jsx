import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

export default function ErrorComponent({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12 bg-danger/10 rounded-lg p-8">
      <div className="text-4xl text-danger">
        <FontAwesomeIcon icon={faExclamationTriangle} />
      </div>
      <p className="text-danger font-semibold">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  )
}
