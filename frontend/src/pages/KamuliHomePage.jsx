import React from 'react'
import { ArrowRight, BookOpen, MapPin, Phone, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SCHOOL_BADGE, SCHOOL_OFFICIAL_NAME } from '../constants/schoolBrand'
import heroImage from '../img/hero.jpeg'
import classImageOne from '../img/class1.jpg'
import classImageTwo from '../img/class2.jpg'
import classImageThree from '../img/class3.jpg'

const gallery = [
  { src: classImageOne, alt: 'Pupils reading together in the school library', title: 'Learning together' },
  { src: classImageTwo, alt: 'A pupil studying among the library shelves', title: 'A quiet place to study' },
  { src: classImageThree, alt: 'A teacher sharing books with pupils', title: 'Stories shared' },
]

export default function KamuliHomePage() {
  return (
    <div className="w-full bg-white text-slate-900">
      <section className="relative flex min-h-[76svh] items-end overflow-hidden bg-[#102d4f] md:min-h-[calc(100svh-5rem)]">
        <img src={heroImage} alt="The entrance to Kamuli Church of Uganda Primary School" className="absolute inset-0 size-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081a30]/95 via-[#0a2442]/50 to-[#102d4f]/5" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8 sm:pb-20 md:pb-24">
          <div className="max-w-3xl text-white">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 p-2 pr-4 backdrop-blur-sm">
              <img src={SCHOOL_BADGE} alt="" className="size-10 rounded-full bg-white object-contain" />
              <span className="text-sm font-semibold">Kamuli CU Library</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-200">Read · Learn · Grow</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">A school library for curious minds.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">Find storybooks, textbooks and learning resources to support every pupil at {SCHOOL_OFFICIAL_NAME}.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/books" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#12365d] transition-colors hover:bg-amber-100">Explore the library <ArrowRight size={17} /></Link>
              <Link to="/digital-collections" className="inline-flex items-center gap-2 rounded-md border border-white/70 bg-[#102d4f]/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">Digital collection</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1fr_0.8fr] md:items-center md:py-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a77914]">Welcome to our library</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-[#102d4f] sm:text-4xl">Books that bring classroom learning to life.</h2>
          </div>
          <p className="text-base leading-7 text-slate-600">Pupils can explore curriculum books across core subjects, discover new stories and use a welcoming space for reading and study. Browse the catalogue to find resources for the school day and beyond.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a77914]">School life</p>
            <h2 className="mt-2 text-3xl font-bold text-[#102d4f]">Our learning community</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">Reading is better when it is shared. Take a look inside the school’s learning spaces.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {gallery.map((item) => <figure key={item.title} className="group overflow-hidden border-b-2 border-[#d6b24a] bg-slate-50">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100"><img src={item.src} alt={item.alt} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div>
            <figcaption className="px-4 py-4 text-base font-bold text-[#102d4f]">{item.title}</figcaption>
          </figure>)}
        </div>
      </section>

      <section className="bg-[#102d4f] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_1fr] md:py-16">
          <div>
            <div className="flex items-center gap-3"><img src={SCHOOL_BADGE} alt="Kamuli CU school badge" className="size-14 rounded-full bg-white object-contain" /><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">Visit our school</p></div>
            <h2 className="mt-5 text-3xl font-bold leading-tight">{SCHOOL_OFFICIAL_NAME}</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/75">Serving pupils and families in Kireka, Kira Municipality, Wakiso District, Uganda.</p>
          </div>
          <address className="grid content-start gap-5 not-italic text-sm">
            <div className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-amber-300" /><span>Kireka, Kira Municipality,<br />Wakiso District, Uganda<br />P.O. Box 30729, Kampala, Uganda</span></div>
            <a href="tel:+256414285548" className="flex items-center gap-3 text-white hover:text-amber-200"><Phone size={18} className="shrink-0 text-amber-300" />0414 285548</a>
            <a href="mailto:kamulicupschool@gmail.com" className="flex items-center gap-3 text-white hover:text-amber-200"><Mail size={18} className="shrink-0 text-amber-300" />kamulicupschool@gmail.com</a>
            <Link to="/books" className="mt-2 inline-flex w-fit items-center gap-2 border-b border-amber-300 pb-1 font-semibold text-amber-200 hover:text-white">Browse library books <BookOpen size={16} /></Link>
          </address>
        </div>
      </section>
    </div>
  )
}