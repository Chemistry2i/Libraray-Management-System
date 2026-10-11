import React, { useEffect, useState } from 'react'
import { Download, HardDrive, ShieldCheck, TrendingUp, Eye, FileDown } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'react-toastify'
import api from '../../../api/axios'

function dateValue(date) {
  return date.toISOString().slice(0, 10)
}

function formatBytes(value) {
  const bytes = Number(value || 0)
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

export default function AdminDigitalAnalytics() {
  const today = new Date()
  const [to, setTo] = useState(dateValue(today))
  const [from, setFrom] = useState(dateValue(new Date(today.getTime() - 29 * 86400000)))
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/digital-collections/admin/analytics', { params: { from, to } })
      .then(({ data }) => { if (active) setAnalytics(data?.data || null) })
      .catch((error) => { if (active) toast.error(error.response?.data?.message || 'Could not load digital analytics') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [from, to])

  async function exportCsv() {
    setExporting(true)
    try {
      const { data } = await api.get('/digital-collections/admin/export.csv', { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = 'digital-collections-export.csv'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not export collection metadata')
    } finally {
      setExporting(false)
    }
  }

  const totals = analytics?.totals || {}
  const period = analytics?.period || {}
  const cards = [
    { label: 'Digital objects', value: Number(totals.total_objects || 0).toLocaleString(), detail: `${totals.public_objects || 0} public · ${totals.private_objects || 0} private`, icon: FileDown },
    { label: 'Views', value: Number(period.views || 0).toLocaleString(), detail: 'In selected period', icon: Eye },
    { label: 'Downloads', value: Number(period.downloads || 0).toLocaleString(), detail: 'In selected period', icon: Download },
    { label: 'Storage used', value: formatBytes(totals.storage_bytes), detail: `${totals.unassessed_objects || 0} unassessed items`, icon: HardDrive },
  ]

  return (
    <div className="space-y-7 pb-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Archives / Reporting</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Digital Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">Collection inventory and public usage over time.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-gray-600">From<input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="mt-1 block rounded-md border border-gray-300 px-2.5 py-2 text-sm font-normal" /></label>
          <label className="text-xs font-semibold text-gray-600">To<input type="date" value={to} min={from} max={dateValue(today)} onChange={(event) => setTo(event.target.value)} className="mt-1 block rounded-md border border-gray-300 px-2.5 py-2 text-sm font-normal" /></label>
          <button type="button" onClick={exportCsv} disabled={exporting} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-emerald-800 hover:text-emerald-800 disabled:opacity-50"><Download size={16} />{exporting ? 'Exporting…' : 'Export CSV'}</button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, detail, icon: Icon }) => <article key={label} className="border-y border-gray-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between"><p className="text-sm font-semibold text-gray-600">{label}</p><Icon size={18} className="text-emerald-800" /></div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{loading ? '—' : value}</p>
          <p className="mt-1 text-xs text-gray-500">{detail}</p>
        </article>)}
      </section>

      {Number(totals.unassessed_objects || 0) > 0 && <p className="flex items-center gap-2 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-900"><ShieldCheck size={17} />{totals.unassessed_objects} object(s) need rights review.</p>}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <article className="border-y border-gray-200 bg-white py-4">
          <div className="px-4 pb-3"><h2 className="font-bold text-gray-900">Views and downloads</h2><p className="mt-1 text-xs text-gray-500">Monthly activity in the selected date range</p></div>
          <div className="h-72 w-full">
            {analytics?.monthly?.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.monthly} margin={{ top: 8, right: 18, bottom: 2, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Line type="monotone" dataKey="views" stroke="#147d64" strokeWidth={2} /><Line type="monotone" dataKey="downloads" stroke="#d27a32" strokeWidth={2} />
            </LineChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-gray-500">{loading ? 'Loading…' : 'No usage recorded for this period.'}</div>}
          </div>
        </article>

        <article className="border-y border-gray-200 bg-white py-4">
          <div className="px-4 pb-3"><h2 className="font-bold text-gray-900">Objects by material</h2><p className="mt-1 text-xs text-gray-500">Current collection inventory</p></div>
          <div className="h-72 w-full">
            {analytics?.materials?.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.materials} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} /><YAxis type="category" dataKey="material_type" width={145} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="object_count" fill="#147d64" radius={[0, 3, 3, 0]} />
            </BarChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-gray-500">{loading ? 'Loading…' : 'No digital objects yet.'}</div>}
          </div>
        </article>
      </section>

      <section className="border-y border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-4"><TrendingUp size={18} className="text-emerald-800" /><h2 className="font-bold text-gray-900">Most-used collections</h2></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-600"><tr><th className="px-4 py-3">Collection</th><th className="px-4 py-3 text-right">Views</th><th className="px-4 py-3 text-right">Downloads</th></tr></thead><tbody className="divide-y divide-gray-100">{(analytics?.popularCollections || []).map((collection) => <tr key={collection.collection_id}><td className="px-4 py-3 font-semibold text-gray-800">{collection.title}</td><td className="px-4 py-3 text-right">{Number(collection.views || 0).toLocaleString()}</td><td className="px-4 py-3 text-right">{Number(collection.downloads || 0).toLocaleString()}</td></tr>)}{!loading && !analytics?.popularCollections?.length && <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-500">No collections to report.</td></tr>}</tbody></table></div>
      </section>
    </div>
  )
}