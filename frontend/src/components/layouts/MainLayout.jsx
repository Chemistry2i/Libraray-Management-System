import { Outlet } from 'react-router-dom'
import Navigation from '../Navigation'
import Footer from '../Footer'
import CommandPalette from '../CommandPalette'
import { PageTransition } from '../PageTransition'
import ScrollToTop from '../ScrollToTop'
import CookieConsent from '../CookieConsent'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-light">
      <Navigation />
      <main className="flex-grow flex flex-col">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <CommandPalette />
      <ScrollToTop />
      <CookieConsent />
    </div>
  )
}
