import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { SCHOOL_BADGE, SCHOOL_NAME, SCHOOL_OFFICIAL_NAME } from '../constants/schoolBrand'

export default function SchoolFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#102d4f] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3">
          <img src={SCHOOL_BADGE} alt="Kamuli CU school badge" className="size-12 shrink-0 rounded-xl border border-amber-300/80 bg-white p-1 object-contain shadow-sm" />
          <div>
            <p className="font-bold">{SCHOOL_NAME}</p>
            <p className="mt-1 text-sm text-white/70">{SCHOOL_OFFICIAL_NAME}</p>
            <p className="mt-3 flex items-center gap-2 text-xs text-white/70"><MapPin size={14} /> Kireka, Kira Municipality, Wakiso District, Uganda</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <a href="tel:+256414285548" className="flex items-center gap-2 text-white/85 hover:text-amber-200"><Phone size={15} />0414 285548</a>
          <a href="mailto:kamulicupschool@gmail.com" className="flex items-center gap-2 text-white/85 hover:text-amber-200"><Mail size={15} />kamulicupschool@gmail.com</a>
          <div className="flex gap-4 border-t border-white/15 pt-3 text-xs text-white/65"><Link to="/books" className="hover:text-white">Library catalogue</Link><Link to="/digital-collections" className="hover:text-white">Digital archive</Link></div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-3 text-center text-xs text-white/55">&copy; {new Date().getFullYear()} {SCHOOL_OFFICIAL_NAME}</div>
    </footer>
  )
}