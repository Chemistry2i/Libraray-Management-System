import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faTwitter, faInstagram, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight, faBookOpen, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark text-white border-t border-white/10 font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-4 pr-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <FontAwesomeIcon icon={faBookOpen} className="text-white text-lg" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight">Blis<span className="text-primary">.</span></span>
            </div>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              A comprehensive, enterprise-grade library management system designed to streamline catalogs, borrowing workflows, and digital inventory globally.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300">
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300">
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300">
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
            </div>
          </div>

          {/* Solutions Links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider text-sm">Platform</h3>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><Link to="/features" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Features</Link></li>
              <li><Link to="/enterprise" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Enterprise</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Pricing</Link></li>
              <li><Link to="/security" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Security</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider text-sm">Company</h3>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><Link to="/about" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Careers <span className="ml-2 text-[10px] bg-primary/20 text-primary py-0.5 px-2 rounded-full">Hiring</span></Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="lg:col-span-4">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider text-sm">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest product updates, library management tips, and enterprise features.
            </p>
            <form className="relative mt-2" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-32 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
                <button 
                  type="submit" 
                  className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-primary-dark text-white px-4 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                >
                  Subscribe <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Blis Library Systems. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Support Status</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
