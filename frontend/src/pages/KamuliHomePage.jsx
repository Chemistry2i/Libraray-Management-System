import React, { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, MapPin, Phone, Mail, ChevronDown, Send, UserRound, Tag, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { SCHOOL_BADGE, SCHOOL_NAME, SCHOOL_OFFICIAL_NAME } from '../constants/schoolBrand'
import heroImage from '../img/hero.jpeg'
import classImageOne from '../img/class1.jpg'
import classImageTwo from '../img/class2.jpg'
import classImageThree from '../img/class3.jpg'

const gallery = [
  { src: classImageOne, alt: 'Pupils reading together in the school library', title: 'Learning together' },
  { src: classImageTwo, alt: 'A pupil studying among the library shelves', title: 'A quiet place to study' },
  { src: classImageThree, alt: 'A teacher sharing books with pupils', title: 'Stories shared' },
]

const contributors = [
  {
    name: 'Mbawadde Doreen',
    initials: 'MD',
    email: 'doreen@example.invalid',
    description: 'Contributing to a welcoming digital library experience for the school community.',
  },
  {
    name: 'Ssenyonga Lucy',
    initials: 'SL',
    email: 'lucy@example.invalid',
    description: 'Helping make school reading resources easier for pupils and teachers to discover.',
  },
]

const readingImages = [
  { src: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85', alt: 'Rows of books in a library', label: 'A world of books' },
  { src: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=85', alt: 'Books ready to be read and studied', label: 'Ideas to explore' },
  { src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85', alt: 'School children learning in a classroom', label: 'Learning in every lesson' },
]

const faqs = [
  ['Who can use the school library?', 'Pupils and teachers of Kamuli Church of Uganda Primary School can use the library in line with school library guidance. Ask the librarian if you need help getting started.'],
  ['How do I find a book?', 'Search the online catalogue by title, author or subject, or ask the librarian to help you find a suitable book.'],
  ['How long can I borrow a book?', 'Loan periods depend on school library rules. Please confirm the due date with the librarian when you borrow a book.'],
  ['Can I reserve a book that is already borrowed?', 'Sign in and check whether the title can be reserved. The library team can explain availability and collection arrangements.'],
  ['How do I contact the school?', 'Call 0414 285548 or email kamulicupschool@gmail.com. The school is located in Kireka, Kira Municipality, Wakiso District.'],
]

export default function KamuliHomePage() {
  const [emailDraftOpened, setEmailDraftOpened] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const scrollReveal = {
    initial: { opacity: prefersReducedMotion ? 0.65 : 0, y: prefersReducedMotion ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: prefersReducedMotion ? 0.24 : 0.55, ease: 'easeOut' },
  }
  const title = 'A school library for curious minds.'
  const [typedTitle, setTypedTitle] = useState(() => prefersReducedMotion ? title : '')

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedTitle(title)
      return undefined
    }

    setTypedTitle('')
    let currentLength = 0
    const typingInterval = window.setInterval(() => {
      currentLength += 1
      setTypedTitle(title.slice(0, currentLength))
      if (currentLength >= title.length) window.clearInterval(typingInterval)
    }, 46)

    return () => window.clearInterval(typingInterval)
  }, [prefersReducedMotion])

  return (
    <div className="w-full bg-white text-slate-900">
      <motion.section {...scrollReveal} className="relative flex min-h-[80vh] items-center overflow-hidden bg-[#102d4f]">
        <img src={heroImage} alt="The entrance to Kamuli Church of Uganda Primary School" className="absolute inset-0 size-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081a30]/95 via-[#0a2442]/50 to-[#102d4f]/5" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 md:py-16">
          <div className="max-w-3xl text-white">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 p-2 pr-4 backdrop-blur-sm">
              <img src={SCHOOL_BADGE} alt="" className="size-10 rounded-full bg-white object-contain" />
              <span className="text-sm font-semibold">Kamuli CU Library</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-200">Read · Learn · Grow</p>
            <h1 aria-label={title} className="relative mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              <span aria-hidden="true" className="invisible">{title}</span>
              <span aria-hidden="true" className="absolute inset-0">
                {typedTitle}
                {!prefersReducedMotion && <motion.span aria-hidden="true" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} className="ml-1 inline-block h-[0.85em] w-[2px] translate-y-[0.08em] bg-amber-300 align-baseline" />}
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">Find storybooks, textbooks and learning resources to support every pupil at {SCHOOL_OFFICIAL_NAME}.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/books" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#12365d] transition-colors hover:bg-amber-100">Explore the library <ArrowRight size={17} /></Link>
              <Link to="/digital-collections" className="inline-flex items-center gap-2 rounded-md border border-white/70 bg-[#102d4f]/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">Digital collection</Link>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...scrollReveal} className="flex items-center border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-2 md:items-center md:gap-14 md:py-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a77914]">Welcome to our library</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-[#102d4f] sm:text-4xl">Books that bring classroom learning to life.</h2>
            <p className="mt-5 text-base leading-7 text-slate-600">Kamuli CU Library is part of the learning community at {SCHOOL_OFFICIAL_NAME}. It helps pupils strengthen literacy, support classwork and build the confidence to explore new subjects through reading.</p>
            <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
              <div><p className="font-bold text-[#102d4f]">For pupils</p><p className="mt-1 text-sm leading-6 text-slate-600">Find stories, reference books and materials for your lessons.</p></div>
              <div><p className="font-bold text-[#102d4f]">For teachers</p><p className="mt-1 text-sm leading-6 text-slate-600">Discover resources that can support classroom teaching.</p></div>
            </div>
          </div>
          <figure className="relative min-h-[320px] overflow-hidden bg-[#102d4f] md:min-h-[460px]">
            <img src={readingImages[0].src} alt={readingImages[0].alt} loading="lazy" className="absolute inset-0 size-full object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#081a30]/90 to-transparent px-5 pb-5 pt-16 text-lg font-bold text-white">A welcoming place to read, learn and grow.</figcaption>
          </figure>
        </div>
      </motion.section>

      <div className="overflow-hidden border-b border-[#d1a93f]/40 bg-[#173b64] py-4 text-white" aria-label="Read, learn and grow together">
        <motion.div
          className="flex w-max items-center gap-8 whitespace-nowrap px-5 text-xs font-bold uppercase sm:gap-12 sm:text-sm"
          animate={prefersReducedMotion ? { x: 0 } : { x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: prefersReducedMotion ? 0 : Infinity, ease: 'linear' }}
        >
          {[0, 1].map((copy) => <div key={copy} aria-hidden={copy === 1} className="flex items-center gap-8 sm:gap-12">
            {['Read with curiosity', 'Learn together', 'Grow through books', 'Kamuli CU Library'].map((phrase) => <span key={`${copy}-${phrase}`} className="flex items-center gap-8 sm:gap-12">{phrase}<span className="text-amber-300">✦</span></span>)}
          </div>)}
        </motion.div>
      </div>

      <motion.section {...scrollReveal} className="flex items-center bg-[#f4f7fa]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a77914]">Explore by subject</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-[#102d4f]">Learning resources for the school curriculum.</h2>
            <p className="mt-4 leading-7 text-slate-600">From class topics to reading for pleasure, browse the catalogue and find something that matches your interests or learning goals.</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {['English', 'Mathematics', 'Science', 'Social Studies', 'Christian Religious Education', 'Storybooks', 'Reference books'].map((subject) => <span key={subject} className="border border-[#c9d5e2] bg-white px-3.5 py-2 text-sm font-semibold text-[#173b64]">{subject}</span>)}
              <Link to="/books" className="inline-flex items-center gap-2 bg-[#173b64] px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#102d4f]">Browse catalogue <ArrowRight size={15} /></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {readingImages.slice(1).map((image, index) => <figure key={image.label} className={`relative min-h-[210px] overflow-hidden bg-[#173b64] ${index === 0 ? 'mt-7' : '-mb-7'}`}>
              <img src={image.src} alt={image.alt} loading="lazy" className="absolute inset-0 size-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#081a30]/90 to-transparent px-3 pb-3 pt-12 text-sm font-bold text-white">{image.label}</figcaption>
            </figure>)}
          </div>
        </div>
      </motion.section>

      <motion.section {...scrollReveal} className="flex items-center bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 md:py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a77914]">School life</p>
            <h2 className="mt-2 text-3xl font-bold text-[#102d4f]">Our learning community</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Pupils and teachers learn side by side every day. These moments capture the curiosity, teamwork and shared love of reading that make our school community special.</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {gallery.map((item) => <figure key={item.title} className="group overflow-hidden border-b-2 border-[#d6b24a] bg-slate-50">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100"><img src={item.src} alt={item.alt} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div>
            <figcaption className="px-4 py-4 text-base font-bold text-[#102d4f]">{item.title}</figcaption>
          </figure>)}
        </div>
        </div>
      </motion.section>

      <motion.section {...scrollReveal} aria-labelledby="contributors-heading" className="overflow-hidden border-y border-slate-200 bg-[#f4f7fa] py-10 sm:py-12">
        <div className="mx-auto mb-6 max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a77914]">People behind the system</p>
          <h2 id="contributors-heading" className="mt-2 text-2xl font-bold text-[#102d4f]">Meet our contributors</h2>
        </div>
        <div className="overflow-hidden" aria-label="Kamuli CU Library system contributors">
          <motion.div
            className="flex w-max"
            animate={prefersReducedMotion ? { x: 0 } : { x: ['0%', '-50%'] }}
            transition={{ duration: 24, repeat: prefersReducedMotion ? 0 : Infinity, ease: 'linear' }}
          >
            {[0, 1].map((copy) => <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center justify-center gap-5 px-4" style={{ minWidth: 'max(100vw, 36rem)' }}>
              {contributors.map((contributor) => <article key={`${copy}-${contributor.initials}`} aria-label={`${contributor.name}, system contributor`} className="w-64 shrink-0 overflow-hidden border border-slate-200 bg-white shadow-sm sm:w-72">
                <div aria-hidden="true" className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#173b64] text-white">
                  <UserRound size={104} strokeWidth={1.1} className="absolute text-white/20" />
                  <span className="relative text-5xl font-bold text-white/90">{contributor.initials}</span>
                  <span className="absolute bottom-3 left-3 border border-white/35 bg-[#102d4f]/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Portrait placeholder</span>
                </div>
                <div className="p-4">
                  <h3 className="truncate font-bold text-[#102d4f]">{contributor.name}</h3>
                  <p className="mt-1 min-h-12 text-xs leading-5 text-slate-600">{contributor.description}</p>
                  <p className="mt-2 break-all border-t border-slate-100 pt-2 text-[11px] text-slate-500">Email placeholder: {contributor.email}</p>
                </div>
              </article>)}
            </div>)}
          </motion.div>
        </div>
      </motion.section>

      <motion.section {...scrollReveal} className="flex items-center border-y border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-16">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a77914]">Borrowing made clear</p>
            <h2 className="mt-2 text-3xl font-bold text-[#102d4f]">Three steps to your next read.</h2>
            <p className="mt-4 leading-7 text-slate-600">The library team can help you choose books and understand borrowing periods. Check the due date when you borrow and return books on time.</p>
            <img src="https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=1000&q=85" alt="A student reading a book at a desk" loading="lazy" className="mt-6 h-64 w-full object-cover md:h-80" />
          </div>
          <ol className="divide-y divide-slate-200 border-y border-slate-200">
            {[
              ['01', 'Choose a book', 'Search the catalogue or ask the librarian for help finding a book for your class or interests.'],
              ['02', 'Borrow from the library', 'Bring your library details and check the loan period with the librarian.'],
              ['03', 'Read and return', 'Enjoy your book and return it by its due date so another pupil can borrow it.'],
            ].map(([number, title, description]) => <li key={number} className="grid grid-cols-[42px_1fr] gap-3 py-5">
              <span className="font-bold text-[#a77914]">{number}</span>
              <div><h3 className="font-bold text-[#102d4f]">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div>
            </li>)}
          </ol>
        </div>
      </motion.section>

      <motion.section {...scrollReveal} className="flex items-center bg-[#102d4f] text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-2 md:gap-10 md:py-16">
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">Good to know</p>
            <h2 className="mt-2 text-3xl font-bold">Library questions, answered.</h2>
          </div>
          <div className="space-y-3">
            {faqs.map(([question, answer]) => <details key={question} className="group border-b border-white/20 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white marker:hidden">{question}<ChevronDown size={18} className="shrink-0 text-amber-300 transition-transform group-open:rotate-180" /></summary>
              <p className="mt-3 pr-8 text-sm leading-6 text-white/75">{answer}</p>
            </details>)}
          </div>
          <figure className="relative min-h-[300px] overflow-hidden bg-[#173b64] md:min-h-[440px]">
            <img src={classImageTwo} alt="Pupils learning together in a classroom" loading="lazy" className="absolute inset-0 size-full object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#081a30]/90 to-transparent px-5 pb-5 pt-16 text-lg font-bold text-white">Ask, discover and keep learning.</figcaption>
          </figure>
        </div>
      </motion.section>

      <motion.section {...scrollReveal} id="contact" className="bg-[#f4f7fa]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 md:gap-14 md:py-16">
          <div>
            <div className="flex items-center gap-3"><img src={SCHOOL_BADGE} alt="Kamuli CU school badge" className="size-14 rounded-xl border border-[#d1a93f] bg-white object-contain p-1" /><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a77914]">Visit or contact us</p></div>
            <h2 className="mt-5 text-3xl font-bold leading-tight text-[#102d4f]">{SCHOOL_OFFICIAL_NAME}</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">Serving pupils and families in Kireka, Kira Municipality, Wakiso District, Uganda.</p>
            <address className="mt-6 grid content-start gap-4 border-y border-slate-200 py-5 not-italic text-sm">
              <div className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-[#a77914]" /><span className="text-slate-700">Kireka, Kira Municipality,<br />Wakiso District, Uganda<br />P.O. Box 30729, Kampala, Uganda</span></div>
              <a href="tel:+256414285548" className="flex items-center gap-3 text-[#173b64] hover:text-[#a77914]"><Phone size={18} className="shrink-0 text-[#a77914]" />0414 285548</a>
              <a href="mailto:kamulicupschool@gmail.com" className="flex items-center gap-3 break-all text-[#173b64] hover:text-[#a77914]"><Mail size={18} className="shrink-0 text-[#a77914]" />kamulicupschool@gmail.com</a>
            </address>
            <div className="mt-6 overflow-hidden rounded-md border border-slate-300 bg-slate-200">
              <iframe
                title="Map to Kamuli Church of Uganda Primary School in Kireka"
                src="https://maps.google.com/maps?q=Kamuli%20Church%20of%20Uganda%20Primary%20School%2C%20Kireka%2C%20Wakiso%2C%20Uganda&z=15&output=embed"
                className="h-64 w-full border-0 sm:h-72"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <Link to="/books" className="mt-4 inline-flex w-fit items-center gap-2 border-b border-[#d1a93f] pb-1 text-sm font-semibold text-[#173b64] hover:text-[#a77914]">Browse library books <BookOpen size={16} /></Link>
          </div>

          <div className="self-start bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a77914]">Get in touch</p>
            <h3 className="mt-2 text-2xl font-bold text-[#102d4f]">Send the school a message</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Complete the form and your email app will prepare a message addressed to the school.</p>
            <form className="mt-6 space-y-4" onSubmit={(event) => {
              event.preventDefault()
              const form = new FormData(event.currentTarget)
              const subject = encodeURIComponent(String(form.get('subject')).trim())
              const body = encodeURIComponent(`Name: ${String(form.get('name')).trim()}\nEmail: ${String(form.get('email')).trim()}\n\n${String(form.get('message')).trim()}`)
              window.location.href = `mailto:kamulicupschool@gmail.com?subject=${subject}&body=${body}`
              setEmailDraftOpened(true)
            }}>
              <label className="block text-sm font-semibold text-[#173b64]">Your name
                <span className="relative mt-1.5 block">
                  <UserRound aria-hidden="true" size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required name="name" autoComplete="name" maxLength={100} placeholder="Your full name" className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-[#173b64] focus:ring-2 focus:ring-[#173b64]/15" />
                </span>
              </label>
              <label className="block text-sm font-semibold text-[#173b64]">Email address
                <span className="relative mt-1.5 block">
                  <Mail aria-hidden="true" size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="email" name="email" autoComplete="email" maxLength={254} placeholder="you@example.com" className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-[#173b64] focus:ring-2 focus:ring-[#173b64]/15" />
                </span>
              </label>
              <label className="block text-sm font-semibold text-[#173b64]">Subject
                <span className="relative mt-1.5 block">
                  <Tag aria-hidden="true" size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required name="subject" maxLength={150} placeholder="How can we help?" className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-[#173b64] focus:ring-2 focus:ring-[#173b64]/15" />
                </span>
              </label>
              <label className="block text-sm font-semibold text-[#173b64]">Message
                <span className="relative mt-1.5 block">
                  <MessageSquare aria-hidden="true" size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <textarea required name="message" rows={5} maxLength={3000} placeholder="Write your message to the school..." className="w-full resize-y rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-[#173b64] focus:ring-2 focus:ring-[#173b64]/15" />
                </span>
              </label>
              <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-[#173b64] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#102d4f]"><Send size={16} />Open email app</button>
              {emailDraftOpened && <p role="status" className="text-sm leading-6 text-[#173b64]">Your email app should open with the message ready. Send it there to contact the school.</p>}
            </form>
          </div>
        </div>
      </motion.section>

      <motion.section {...scrollReveal} className="flex min-h-[76vh] items-center bg-[#173b64] px-5 py-14 text-white sm:px-8 md:min-h-[82vh] md:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-16">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <img src={SCHOOL_BADGE} alt="" className="size-12 rounded-xl border border-amber-300/80 bg-white p-1 object-contain" />
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">{SCHOOL_NAME}</p>
            </div>
            <h2 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">Open a book. Find a new possibility.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/80">Explore school books, discover the digital archive, or sign in to manage your library activity.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/books" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#102d4f] transition-colors hover:bg-amber-100">Browse books <ArrowRight size={16} /></Link>
              <Link to="/register" className="rounded-md border border-white/60 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">Create account</Link>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <h3 className="text-sm font-bold uppercase tracking-wide text-amber-200">Quick links</h3>
            <nav aria-label="Library quick links" className="mt-3 divide-y divide-white/15 border-y border-white/15">
              <Link to="/digital-collections" className="flex items-center justify-between gap-4 py-4 text-sm font-semibold text-white/90 transition-colors hover:text-amber-200"><span>Explore digital collections</span><ArrowRight size={16} /></Link>
              <Link to="/login" className="flex items-center justify-between gap-4 py-4 text-sm font-semibold text-white/90 transition-colors hover:text-amber-200"><span>Sign in to your library account</span><ArrowRight size={16} /></Link>
              <a href="#contact" className="flex items-center justify-between gap-4 py-4 text-sm font-semibold text-white/90 transition-colors hover:text-amber-200"><span>Contact {SCHOOL_OFFICIAL_NAME}</span><ArrowRight size={16} /></a>
            </nav>
            <div className="mt-5 flex flex-col gap-2 text-sm text-white/75 sm:flex-row sm:flex-wrap sm:gap-x-5">
              <a href="tel:+256414285548" className="hover:text-amber-200">0414 285548</a>
              <a href="mailto:kamulicupschool@gmail.com" className="break-all hover:text-amber-200">kamulicupschool@gmail.com</a>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}