import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faShieldAlt, faLaptopCode, faUsers, faArrowRight, 
  faCheckCircle, faQuoteLeft, faChevronDown, faChevronUp,
  faChartLine, faServer, faLock, faPlayCircle, faCloud, 
  faBuilding, faNetworkWired, faTimes
} from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'

const stats = [
  { label: 'Uptime SLA', value: '99.9%' },
  { label: 'Curated Resources', value: '50,000+' },
  { label: 'Active Readers', value: '15,000+' },
  { label: 'Institutions', value: '120+' },
]

const features = [
  {
    id: 'inventory',
    icon: faLaptopCode,
    title: 'Smart Digital Inventory',
    desc: 'Track every title, e-book, and physical asset with real-time barcode scanning and automated sorting.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'security',
    icon: faShieldAlt,
    title: 'Enterprise Security',
    desc: 'Role-based access control, encrypted user data, and strict boundaries to protect digital property.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'analytics',
    icon: faChartLine,
    title: 'Advanced Analytics',
    desc: 'Librarians can generate detailed reports on borrowing trends, overdue assets, and system health in one click.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  }
]

const testimonials = [
  {
    quote: "Our institution migrated to Blis seamlessly. The role-based permissions give our librarians peace of mind.",
    name: "Dr. Sarah Jenkins",
    title: "University Head Librarian"
  },
  {
    quote: "Finding and reserving research papers used to take days. Now it's a matter of seconds. An absolute game changer.",
    name: "Mark T.",
    title: "Post-Graduate Researcher"
  },
  {
    quote: "The automated overdue notifications and fine tracking cut our administrative overhead by 60%.",
    name: "Emma Richards",
    title: "Library Administrator"
  }
]

const faqs = [
  {
    q: "How do I get an account?",
    a: "Because this is a private catalog, you must create an account using your institutional email. An administrator will review and approve your access within 24 hours."
  },
  {
    q: "Can I borrow digital resources?",
    a: "Yes. Approved members can borrow e-books and digital journals directly through the dashboard with instantaneous delivery."
  },
  {
    q: "Information on fines and overdues?",
    a: "Fines for overdue physical books are automatically calculated daily. You can view your current balance directly in your user dashboard under the Fines tab."
  },
  {
    q: "Is my reading history private?",
    a: "Absolutely. We employ strict enterprise-grade encryption. Only you and authorized system administrators can view your borrowing history."
  }
]

const deploymentOptions = [
  {
    title: 'Cloud Hosted (SaaS)',
    icon: faCloud,
    desc: 'Instant deployment, automated backups, and 99.9% guaranteed uptime managed entirely by our team.',
  },
  {
    title: 'On-Premise',
    icon: faBuilding,
    desc: 'Install Blis directly on your internal servers for complete physical control over all data and networking.',
  },
  {
    title: 'Hybrid Enterprise',
    icon: faNetworkWired,
    desc: 'Keep high-security archives on-premise while utilizing our global edge points for fast public catalog delivery.',
  },
]

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(features[0].id)
  const [openFaq, setOpenFaq] = useState(null)
  const [showDemo, setShowDemo] = useState(false)

  return (
    <div className="w-full bg-white flex flex-col font-outfit">
      {/* Video Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDemo(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden border border-white/10"
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/70 text-lg flex items-center gap-3">
                  <FontAwesomeIcon icon={faPlayCircle} className="text-3xl" />
                  [ Demo Video Placeholder ]
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center bg-white overflow-hidden">
        {/* Glowing Ambient Background Blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none z-0"></div>
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none z-0"></div>
        
        {/* Architectural Linear Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#d1d5db_1px,transparent_1px),linear-gradient(to_bottom,#d1d5db_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-0 z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                Smart Enterprise Library Platform
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-dark leading-tight tracking-tight">
                Manage your library <br/>
                <span className="text-primary">intelligently.</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                A secure, comprehensive, and professional platform for institutions to manage resources, track inventory, and serve readers efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg shadow-lg hover:shadow-primary/30 transition-all">
                    Start for free <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button onClick={() => setShowDemo(true)} className="btn-outline flex items-center justify-center gap-2 px-8 py-4 text-lg hover:bg-gray-50 border-gray-200 text-dark w-full sm:w-auto">
                    <FontAwesomeIcon icon={faPlayCircle} className="text-primary text-xl" />
                    Watch Demo
                  </button>
                </motion.div>
              </div>

              {/* Social Proof Avatars */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-8 flex items-center gap-6"
              >
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Librarian 1" />
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Librarian 2" />
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Librarian 3" />
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Librarian 4" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">15k+</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex text-amber-400 text-xs mb-0.5">
                    {'★★★★★'}
                  </div>
                  <span className="font-semibold text-dark">4.9/5</span> from 5,000+ reviews
                </div>
              </motion.div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden md:block h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200/60 bg-white"
            >
              {/* macOS Browser Wrapper Header */}
              <div className="absolute top-0 inset-x-0 h-10 bg-white border-b border-gray-100 flex items-center px-4 gap-2 z-20">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                <div className="flex-1 text-center pr-8">
                  <div className="inline-flex items-center h-6 px-4 bg-gray-100 rounded-md text-[10px] text-gray-500 font-mono font-medium tracking-wider">
                    library.blis-enterprise.com
                  </div>
                </div>
              </div>

              <img 
                src="https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Library Interface Mockup" 
                className="absolute top-10 inset-x-0 w-full h-[calc(100%-40px)] object-cover"
              />
              <div className="absolute top-10 inset-x-0 h-[calc(100%-40px)] bg-gradient-to-t from-dark/90 via-dark/20 to-transparent"></div>

              {/* Floating UI Widget 1 */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-10 right-10 bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-xl flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark">Access Granted</p>
                  <p className="text-xs text-gray-600">Institutional ID Verified</p>
                </div>
              </motion.div>

              {/* Floating UI Widget 2 */}
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute bottom-10 left-10 bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-xl flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <FontAwesomeIcon icon={faUsers} className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark">Live Readers</p>
                  <p className="text-xs text-gray-600">+120 active right now</p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="border-y border-gray-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="px-4"
              >
                <div className="text-4xl font-extrabold text-primary mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Infinite Logo Marquee (Trust Badges) */}
      <section className="py-12 overflow-hidden bg-light border-b border-gray-100 relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-light to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-light to-transparent z-10 pointer-events-none"></div>
        
        <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Trusted by Innovative Institutions</p>
        
        <div className="flex w-[200%] md:w-[150%] lg:w-[120%]">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 30, repeat: Infinity }}
            className="flex w-full justify-around items-center"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-16 md:gap-24 px-8 items-center">
                <span className="text-xl md:text-2xl font-black text-gray-300 font-serif">AeroSpace U</span>
                <span className="text-xl md:text-2xl font-bold text-gray-300">NEXUS Labs</span>
                <span className="text-xl md:text-2xl font-medium text-gray-300 tracking-tighter">GLOBEX Inst.</span>
                <span className="text-xl md:text-2xl font-black text-gray-300 uppercase italic">Pinnacle</span>
                <span className="text-xl md:text-2xl font-semibold text-gray-300">Crescent Medical</span>
                <span className="text-xl md:text-2xl font-extrabold text-gray-300 tracking-widest">NOVA</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="py-32 bg-white min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20 space-y-4"
          >
            <h2 className="text-4xl font-bold text-dark tracking-tight">Enterprise-Grade Workflows</h2>
            <p className="text-xl text-gray-600">Built to handle massive catalogs without compromising on speed or security.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="lg:col-span-5 space-y-4">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border ${
                    activeFeature === feature.id 
                      ? 'bg-light border-primary/20 shadow-sm' 
                      : 'bg-white border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 text-2xl ${activeFeature === feature.id ? 'text-primary' : 'text-gray-400'}`}>
                      <FontAwesomeIcon icon={feature.icon} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${activeFeature === feature.id ? 'text-dark' : 'text-gray-600'}`}>
                        {feature.title}
                      </h3>
                      <p className={`leading-relaxed ${activeFeature === feature.id ? 'text-gray-600' : 'hidden'}`}>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="lg:col-span-7 relative h-[450px] rounded-2xl overflow-hidden shadow-airbnb-lg bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeFeature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  src={features.find(f => f.id === activeFeature)?.image}
                  alt={features.find(f => f.id === activeFeature)?.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Before & After (ROI) */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-dark tracking-tight">The Blis Advantage</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Transform hours of manual labor into instant, automated workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Before */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-red-50/50 p-8 rounded-3xl border border-red-100"
            >
              <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-red-200 text-red-600 flex items-center justify-center text-sm">✕</span>
                The Old Way
              </h3>
              <ul className="space-y-4">
                {[
                  "Spreadsheets and manual trackers",
                  "Unreliable communication and lost books",
                  "Manual penalty and fine calculations",
                  "No visibility into reading habits or analytics"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 text-red-800/80">
                    <FontAwesomeIcon icon={faTimes} className="mt-1 text-red-400 opacity-50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* After */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-primary/5 p-8 rounded-3xl border border-primary/20 shadow-[0_0_40px_rgba(var(--color-primary),0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10 text-primary mix-blend-multiply">
                <FontAwesomeIcon icon={faChartLine} className="text-9xl" />
              </div>
              <h3 className="text-2xl font-bold text-primary-dark mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">✓</span>
                With Blis
              </h3>
              <ul className="space-y-4">
                {[
                  "Real-time unified digital dashboard",
                  "Automated email notifications and reminders",
                  "Instant fine calculation and payment gateways",
                  "Deep analytics on borrowing trends and inventory"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 text-primary-dark/80 relative z-10">
                    <FontAwesomeIcon icon={faCheckCircle} className="mt-1 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security & Private Catalog Section */}
      <section className="py-32 bg-dark text-white min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="text-primary text-4xl">
                <FontAwesomeIcon icon={faLock} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">A private, curated catalog.</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                To protect intellectual property and maintain an exclusive environment, our catalog is restricted to registered members only.
              </p>
              <ul className="space-y-6 pt-4">
                {[
                  'Create a verified institutional account',
                  'Wait for administrative approval',
                  'Access the full digital and physical catalog',
                  'Borrow, read, and track seamlessly'
                ].map((step, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-lg text-gray-200">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-primary text-xl shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Library Archive"
                className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 space-y-4"
          >
            <h2 className="text-4xl font-bold text-dark tracking-tight">Trusted by Professionals</h2>
            <p className="text-xl text-gray-600">Hear how Blis is transforming library management worldwide.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              >
                <FontAwesomeIcon icon={faQuoteLeft} className="text-4xl text-primary/20 mb-6" />
                <p className="text-gray-700 text-lg italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold text-dark">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Options Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-dark tracking-tight">Flexible Deployments</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Deploy Blis exactly how your IT and compliance policies require.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deploymentOptions.map((opt, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-airbnb border border-gray-100 hover:border-primary/30 transition-colors"
              >
                <div className="text-4xl text-primary mb-6">
                  <FontAwesomeIcon icon={opt.icon} />
                </div>
                <h3 className="text-xl font-bold text-dark mb-4">{opt.title}</h3>
                <p className="text-gray-600 leading-relaxed">{opt.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-dark tracking-tight">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-6 flex justify-between items-center bg-white hover:bg-light transition-colors"
                >
                  <span className="font-bold text-lg text-dark">{faq.q}</span>
                  <FontAwesomeIcon 
                    icon={openFaq === idx ? faChevronUp : faChevronDown} 
                    className="text-gray-400"
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-light"
                    >
                      <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-32 bg-primary text-white flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to modernize your platform?</h2>
          <p className="text-xl text-white/90">
            Join the exclusive network today and empower your staff and readers with an enterprise-grade library system.
          </p>
          <div className="pt-4">
            <Link to="/register" className="inline-block bg-white text-primary font-bold px-10 py-5 rounded-xl hover:bg-gray-50 transition-all hover:scale-105 duration-300 shadow-xl text-lg">
              Create Your Account Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
