import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCookieBite } from '@fortawesome/free-solid-svg-icons'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('blis_cookie_consent')
    if (!consent) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('blis_cookie_consent', 'true')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <FontAwesomeIcon icon={faCookieBite} className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-dark text-lg mb-1">Your privacy is important to us</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We use cookies and similar technologies to ensure our platform works efficiently, analyze traffic, 
                  and improve your experience. By clicking "Accept", you agree to our use of cookies.
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto shrink-0">
              <button 
                onClick={() => setIsVisible(false)} 
                className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                aria-label="Decline cookies"
              >
                Decline
              </button>
              <button 
                onClick={acceptCookies}
                className="flex-1 md:flex-none px-6 py-3 rounded-lg bg-dark text-white font-semibold shadow-lg hover:bg-primary transition-colors"
                aria-label="Accept cookies"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}