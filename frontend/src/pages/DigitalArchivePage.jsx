import React, { useEffect, useState } from 'react'
import { ArrowUpRight, FileImage, FileText, Search } from 'lucide-react'
import api from '../api/axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export default function DigitalArchivePage() {
  const [objects, setObjects] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/digital-collections/public/objects')
      .then(({ data }) => setObjects(data?.data?.objects || []))
      .catch(() => setError('The digital archive is unavailable right now.'))
      .finally(() => setLoading(false))
  }, [])

  const filteredObjects = objects.filter((object) => (
    `${object.title} ${object.creator || ''} ${object.material_type} ${object.collection_title}`
      .toLowerCase().includes(search.toLowerCase())
  ))

  return (
    <div className="flex-1 bg-[#f5f7f4]">
      <header className="border-b border-emerald-950/15 bg-[#173d35] text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Blis Library · Digital Archive</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">Local records, preserved for discovery.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50/85">Browse digitized photographs, documents, and publications cleared for public access.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-7 flex flex-col gap-4 border-b border-gray-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse the collection</h2>
            <p className="mt-1 text-sm text-gray-600">{objects.length} publicly available {objects.length === 1 ? 'item' : 'items'}</p>
          </div>
          <label className="relative w-full sm:max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, creator, material…" className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/15" />
          </label>
        </div>

        {loading ? <p className="py-12 text-center text-sm text-gray-600">Loading digital archive…</p>
          : error ? <p role="alert" className="py-12 text-center text-sm text-rose-700">{error}</p>
            : filteredObjects.length ? <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">
              {filteredObjects.map((object) => {
                const fileUrl = `${apiBaseUrl}/digital-collections/public/objects/${object.object_id}/file`
                const isPdf = object.mime_type === 'application/pdf'
                return <article key={object.object_id} className="flex min-w-0 items-start gap-4 border-b border-gray-300 py-5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-white text-emerald-800 ring-1 ring-gray-200">
                    {isPdf ? <FileText size={22} /> : <FileImage size={22} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{object.collection_title}</p>
                    <h3 className="mt-1 truncate text-lg font-bold text-gray-900">{object.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{object.creator || 'Creator unknown'} · {object.material_type}</p>
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline">
                      Open {isPdf ? 'document' : 'image'} <ArrowUpRight size={15} />
                    </a>
                  </div>
                </article>
              })}
            </div> : <p className="py-12 text-center text-sm text-gray-600">{objects.length ? 'No items match your search.' : 'No public digital objects are available yet.'}</p>}
      </main>
    </div>
  )
}