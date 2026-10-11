import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { SCHOOL_BADGE, SCHOOL_NAME, SCHOOL_OFFICIAL_NAME } from '../constants/schoolBrand'

export default function SchoolFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#102d4f] text-white">
      <div className="mx-auto grid max-w-7xl gap-9 px-5 py-10 sm:px-8 md:grid-cols-[1.2fr_1fr_0.7fr] md:py-12">
        <div>
          <div className="flex items-start gap-3">
            <img src={SCHOOL_BADGE} alt="Kamuli CU school badge" className="size-14 shrink-0 rounded-xl border border-amber-300/80 bg-white p-1 object-contain shadow-sm" />
            <div>
              <p className="font-bold">{SCHOOL_NAME}</p>
              <p className="mt-1 text-sm leading-5 text-white/70">{SCHOOL_OFFICIAL_NAME}</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">Supporting pupils and teachers with books, reading and learning resources for the school community.</p>
        </div>

        <address className="not-italic">
          <h2 className="text-sm font-bold text-white">School contact</h2>
          <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-white/70"><MapPin size={15} className="mt-1 shrink-0 text-amber-300" />Kireka, Kira Municipality,<br />Wakiso District, Uganda<br />P.O. Box 30729, Kampala, Uganda</p>
          <a href="tel:+256414285548" className="mt-3 flex items-center gap-2 text-sm text-white/85 hover:text-amber-200"><Phone size={15} className="text-amber-300" />0414 285548</a>
          <a href="mailto:kamulicupschool@gmail.com" className="mt-2 flex items-center gap-2 break-all text-sm text-white/85 hover:text-amber-200"><Mail size={15} className="shrink-0 text-amber-300" />kamulicupschool@gmail.com</a>
        </address>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-bold text-white">Explore</h2>
          <div className="mt-3 flex flex-col items-start gap-2 text-sm text-white/75">
            <Link to="/" className="hover:text-amber-200">Home</Link>
            <Link to="/books" className="hover:text-amber-200">Browse books</Link>
            <Link to="/digital-collections" className="hover:text-amber-200">Digital archive</Link>
            <Link to="/register" className="hover:text-amber-200">Create a library account</Link>
            <Link to="/login" className="hover:text-amber-200">Sign in</Link>
          </div>
        </nav>
      </div>
      <div className="border-t border-white/10 px-5 py-3 text-center text-xs text-white/55">&copy; {new Date().getFullYear()} {SCHOOL_OFFICIAL_NAME}. Kamuli CU Library.</div>
    </footer>
  )
}