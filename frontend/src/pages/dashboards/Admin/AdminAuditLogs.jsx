import React, { useEffect, useState } from 'react'
import { ArrowDownToLine, Eye, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../../api/axios'

function formatDate(value) {
  return new Date(value).toLocaleString()
}

export default function AdminAuditLogs() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [eventType, setEventType] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(search.trim()), 250)
    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/digital-collections/admin/audit-logs', {
      params: { page, limit: 25, event_type: eventType || undefined, search: searchQuery || undefined },
    })
      .then(({ data }) => {
        if (!active) return
        setEvents(data?.data?.events || [])
        setPagination(data?.data?.pagination || { page: 1, pages: 0, total: 0 })
      })
      .catch((error) => {
        if (active) toast.error(error.response?.data?.message || 'Could not load audit logs')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [eventType, page, searchQuery])

  function updateSearch(value) {
    setPage(1)
    setSearch(value)
  }

  function updateEventType(value) {
    setPage(1)
    setEventType(value)
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Administration / Oversight</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-sm text-gray-600">Digital collection views and downloads, including the actor and timestamp when available.</p>
        </div>
        <p className="text-sm font-semibold text-gray-700">{pagination.total.toLocaleString()} events</p>
      </header>

      <section className="flex flex-col gap-3 border-y border-gray-200 py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search title, file, collection, or user" className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm" />
        </label>
        <select aria-label="Filter by audit event" value={eventType} onChange={(event) => updateEventType(event.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm sm:w-48">
          <option value="">All events</option>
          <option value="view">Views</option>
          <option value="download">Downloads</option>
        </select>
      </section>

      <section className="overflow-x-auto border-y border-gray-200">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr><th className="px-4 py-3">Event</th><th className="px-4 py-3">Digital object</th><th className="px-4 py-3">Collection</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Date and time</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan="5" className="px-4 py-10 text-center text-gray-500">Loading audit logs…</td></tr>
              : events.length ? events.map((event) => <tr key={event.event_id}>
                <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${event.event_type === 'download' ? 'bg-emerald-800 text-white' : 'border border-emerald-800 text-emerald-900'}`}>{event.event_type === 'download' ? <ArrowDownToLine size={14} /> : <Eye size={14} />}{event.event_type === 'download' ? 'Download' : 'View'}</span></td>
                <td className="px-4 py-3"><p className="font-semibold text-gray-900">{event.object_title}</p><p className="mt-0.5 text-xs text-gray-500">{event.original_filename} · {event.material_type}</p></td>
                <td className="px-4 py-3 text-gray-700">{event.collection_title}</td>
                <td className="px-4 py-3 text-gray-700">{event.first_name ? `${event.first_name} ${event.last_name || ''}`.trim() : event.email || 'Public visitor'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(event.created_at)}</td>
              </tr>) : <tr><td colSpan="5" className="px-4 py-10 text-center text-gray-500">No digital collection events match these filters.</td></tr>}
          </tbody>
        </table>
      </section>

      {pagination.pages > 1 && <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Page {pagination.page} of {pagination.pages}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-md border border-gray-300 px-3 py-2 font-semibold text-gray-700 disabled:opacity-40">Previous</button>
          <button type="button" disabled={page >= pagination.pages || loading} onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))} className="rounded-md border border-gray-300 px-3 py-2 font-semibold text-gray-700 disabled:opacity-40">Next</button>
        </div>
      </div>}
    </div>
  )
}
