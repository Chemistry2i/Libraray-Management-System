import { Outlet } from 'react-router-dom'
import Navigation from '../Navigation'
import CommandPalette from '../CommandPalette'
import { PageTransition } from '../PageTransition'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-grow flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Subtle dot background for professional feel */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
        
        <div className="z-10 w-full flex justify-center items-center">
          <PageTransition>
            <div className="flex justify-center w-full">
              <Outlet />
            </div>
          </PageTransition>
        </div>
      </main>
      <CommandPalette />
    </div>
  )
}
