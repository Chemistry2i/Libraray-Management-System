import React, { useEffect, useState } from 'react'
import { Download, Eye, FileImage, FileText, Music2, Search, Video, X } from 'lucide-react'
import api from '../api/axios'
import { SCHOOL_NAME } from '../constants/schoolBrand'
import DigitalObjectPreview from '../components/DigitalObjectPreview'

const materialTypes = [
  'Historical Photograph', 'Newsletter', 'Report', 'Newspaper Clipping',
  'Exam Paper', 'Poster', 'Local-History Document',
]

export default function DigitalArchivePage() {
  const [objects, setObjects] = useState([])
  const [collections, setCollections] = useState([])
  const [search, setSearch] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [materialType, setMaterialType] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewFile, setPreviewFile] = useState(null)

  useEffect(() => {
    if (!previewFile?.url) return undefined
    return () => URL.revokeObjectURL(previewFile.url)
  }, [previewFile])

  useEffect(() => {
    api.get('/digital-collections/public/collections')
      .then(({ data }) => setCollections(data?.data?.collections || []))
      .catch(() => setCollections([]))
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(search.trim()), 250)
    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api.get('/digital-collections/public/objects', {
      params: {
        search: searchQuery,
        collection_id: collectionId || undefined,
        material_type: materialType || undefined,
        sort,
        page,
        limit: 12,
      },
    })
      .then(({ data }) => {
        if (!active) return
        setObjects(data?.data?.objects || [])
        setPagination(data?.data?.pagination || { page: 1, pages: 0, total: 0 })
      })
      .catch(() => { if (active) setError('The digital archive is unavailable right now.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [searchQuery, collectionId, materialType, sort, page])

  function resetPage(update) {
    setPage(1)
    update()
  }

  async function viewObject(object) {
    setPreviewFile({ object, url: null, loading: true })
    try {
      const { data } = await api.get(`/digital-collections/public/objects/${object.object_id}/file`, { responseType: 'blob' })
      setPreviewFile({ object, url: URL.createObjectURL(data), loading: false })
    } catch {
      setPreviewFile({ object, url: null, loading: false, error: 'This file could not be opened right now.' })
    }
  }

  return (
    <div className="flex-1 bg-[#f5f7f4]">
      <header className="border-b border-emerald-950/15 bg-[#173d35] text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">{SCHOOL_NAME} · Digital Archive</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">Local records, preserved for discovery.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50/85">Browse digitized photographs, documents, and publications cleared for public access.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-7 flex flex-col gap-4 border-b border-gray-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse the collection</h2>
            <p className="mt-1 text-sm text-gray-600">{pagination.total} publicly available {pagination.total === 1 ? 'item' : 'items'}</p>
          </div>
          <div className="grid w-full gap-2 sm:max-w-3xl sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative sm:col-span-2 lg:col-span-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={(event) => resetPage(() => setSearch(event.target.value))} placeholder="Search archive" className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/15" />
            </label>
            <select aria-label="Filter by collection" value={collectionId} onChange={(event) => resetPage(() => setCollectionId(event.target.value))} className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm">
              <option value="">All collections</option>
              {collections.map((collection) => <option key={collection.collection_id} value={collection.collection_id}>{collection.title}</option>)}
            </select>
            <select aria-label="Filter by material type" value={materialType} onChange={(event) => resetPage(() => setMaterialType(event.target.value))} className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm">
              <option value="">All material types</option>
              {materialTypes.map((material) => <option key={material}>{material}</option>)}
            </select>
            <select aria-label="Sort archive" value={sort} onChange={(event) => resetPage(() => setSort(event.target.value))} className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm">
              <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="title">Title A-Z</option><option value="popular">Most viewed/downloaded</option>
            </select>
          </div>
        </div>

        {loading ? <p className="py-12 text-center text-sm text-gray-600">Loading digital archive…</p>
          : error ? <p role="alert" className="py-12 text-center text-sm text-rose-700">{error}</p>
            : objects.length ? <>
              <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">
              {objects.map((object) => {
                const downloadUrl = api.getUri({ url: `/digital-collections/public/objects/${object.object_id}/download` })
                const isPdf = object.mime_type === 'application/pdf'
                const isVideo = object.mime_type?.startsWith('video/')
                const isAudio = object.mime_type?.startsWith('audio/')
                const isDocument = object.mime_type?.includes('msword') || object.mime_type?.includes('excel') || object.mime_type?.includes('powerpoint') || object.mime_type?.includes('word') || object.mime_type?.includes('sheet') || object.mime_type?.includes('presentation') || object.mime_type?.startsWith('text/') || object.mime_type?.includes('rtf')
                return <article key={object.object_id} className="flex min-w-0 items-start gap-5 border-b border-gray-300 py-6">
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-md bg-white text-emerald-800 ring-1 ring-gray-200">
                    {isPdf || isDocument ? <FileText size={42} /> : isVideo ? <Video size={42} /> : isAudio ? <Music2 size={42} /> : <FileImage size={42} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{object.collection_title}</p>
                    <h3 className="mt-1 truncate text-lg font-bold text-gray-900">{object.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{object.creator || 'Creator unknown'} · {object.material_type}</p>
                    {object.dc_description && <p className="mt-2 line-clamp-2 text-sm text-gray-600">{object.dc_description}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                      <button type="button" onClick={() => viewObject(object)} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
                        <Eye size={15} /> View {isPdf || isDocument ? 'document' : isVideo ? 'video' : isAudio ? 'audio' : 'image'}
                      </button>
                      <a href={downloadUrl} className="inline-flex items-center gap-1.5 rounded-md border border-emerald-800 px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50" download><Download size={15} />Download</a>
                    </div>
                  </div>
                </article>
              })}
              </div>
              {pagination.pages > 1 && <div className="mt-7 flex items-center justify-between border-t border-gray-300 pt-4 text-sm">
                <span className="text-gray-600">Page {pagination.page} of {pagination.pages}</span>
                <div className="flex gap-2">
                  <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded border border-gray-300 px-3 py-2 font-semibold text-gray-700 disabled:opacity-40">Previous</button>
                  <button type="button" disabled={page >= pagination.pages || loading} onClick={() => setPage((value) => Math.min(pagination.pages, value + 1))} className="rounded border border-gray-300 px-3 py-2 font-semibold text-gray-700 disabled:opacity-40">Next</button>
                </div>
              </div>}
            </> : <p className="py-12 text-center text-sm text-gray-600">{pagination.total ? 'No items match these filters.' : 'No public digital objects are available yet.'}</p>}
      </main>
      {previewFile && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewFile(null) }}>
        <section role="dialog" aria-modal="true" aria-labelledby="archive-preview-title" className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
            <h2 id="archive-preview-title" className="truncate font-semibold text-gray-900">{previewFile.object.title}</h2>
            <button type="button" aria-label="Close preview" onClick={() => setPreviewFile(null)} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"><X size={19} /></button>
          </div>
          <div className="flex min-h-[50vh] flex-1 items-center justify-center overflow-auto bg-gray-100 p-4">
            <DigitalObjectPreview
              object={previewFile.object}
              url={previewFile.url}
              loading={previewFile.loading}
              error={previewFile.error}
              downloadUrl={api.getUri({ url: `/digital-collections/public/objects/${previewFile.object.object_id}/download` })}
            />
          </div>
          <dl className="grid gap-x-6 gap-y-3 overflow-y-auto border-t border-gray-200 px-5 py-4 text-sm sm:grid-cols-2">
            {[
              ['Identifier', previewFile.object.dc_identifier],
              ['Creator', previewFile.object.creator],
              ['Date', previewFile.object.dc_date],
              ['Subject', previewFile.object.dc_subject],
              ['Description', previewFile.object.dc_description],
              ['Type', previewFile.object.dc_type],
              ['Format', previewFile.object.dc_format || previewFile.object.mime_type],
              ['Language', previewFile.object.dc_language],
            ].filter(([, value]) => value).map(([label, value]) => (
              <div key={label} className={label === 'Description' || label === 'Subject' ? 'sm:col-span-2' : ''}>
                <dt className="font-semibold text-gray-700">{label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap break-words text-gray-600">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>}
    </div>
  )
}