import React, { useEffect, useRef, useState } from 'react'
import { FileImage, FileText, FolderPlus, LockKeyhole, Plus, ShieldCheck, Trash2, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../../api/axios'

const materialTypes = [
  'Historical Photograph', 'Newsletter', 'Report', 'Newspaper Clipping',
  'Exam Paper', 'Poster', 'Local-History Document',
]

const rightsStatuses = ['Public Domain', 'Copyrighted - Permitted', 'Sensitive - Restricted']
const allowedFileTypes = '.pdf,.png,.jpg,.jpeg'

const emptyCollection = { title: '', description: '', selection_criteria: '', collection_value: '' }

function metadataFor(file) {
  return {
    title: file.name.replace(/\.[^.]+$/, ''),
    creator: '',
    material_type: materialTypes[0],
    rights_status: rightsStatuses[0],
    rights_assessment_notes: '',
    is_public: false,
  }
}

export default function AdminDigitalCollections() {
  const [collections, setCollections] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [objects, setObjects] = useState([])
  const [collectionForm, setCollectionForm] = useState(emptyCollection)
  const [files, setFiles] = useState([])
  const [metadata, setMetadata] = useState([])
  const [rightsConfirmed, setRightsConfirmed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingCollection, setSavingCollection] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef(null)

  const selectedCollection = collections.find((collection) => String(collection.collection_id) === selectedId)

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setObjects([])
      return
    }
    loadObjects(selectedId)
  }, [selectedId])

  async function loadCollections() {
    try {
      const { data } = await api.get('/digital-collections/collections')
      const items = data?.data?.collections || []
      setCollections(items)
      if (items.length) setSelectedId((current) => current || String(items[0].collection_id))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load digital collections')
    } finally {
      setLoading(false)
    }
  }

  async function loadObjects(collectionId) {
    try {
      const { data } = await api.get(`/digital-collections/collections/${collectionId}/objects`)
      setObjects(data?.data?.objects || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load collection objects')
    }
  }

  async function createCollection(event) {
    event.preventDefault()
    setSavingCollection(true)
    try {
      const { data } = await api.post('/digital-collections/collections', collectionForm)
      const newId = data?.data?.collection_id
      setCollectionForm(emptyCollection)
      await loadCollections()
      if (newId) setSelectedId(String(newId))
      toast.success('Collection created')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create collection')
    } finally {
      setSavingCollection(false)
    }
  }

  function acceptFiles(fileList) {
    const chosen = Array.from(fileList || [])
    if (files.length + chosen.length > 15) {
      toast.error('A batch can contain up to 15 files')
      return
    }
    const validFiles = chosen.filter((file) => /\.(pdf|png|jpe?g)$/i.test(file.name))
    if (validFiles.length !== chosen.length) toast.error('Only PDF, PNG, and JPEG files are supported')
    if (!validFiles.length) return
    setFiles((current) => [...current, ...validFiles])
    setMetadata((current) => [...current, ...validFiles.map(metadataFor)])
    setRightsConfirmed(false)
  }

  function updateMetadata(index, key, value) {
    setMetadata((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value } : item
    )))
  }

  function removeFile(index) {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setMetadata((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setRightsConfirmed(false)
  }

  async function uploadBatch(event) {
    event.preventDefault()
    if (!selectedId || !files.length) return
    if (!rightsConfirmed || metadata.some((item) => !item.rights_assessment_notes.trim())) {
      toast.error('Confirm the rights assessment and add notes for every file')
      return
    }
    if (metadata.some((item) => item.is_public && item.rights_status === 'Sensitive - Restricted')) {
      toast.error('Sensitive restricted files cannot be made public')
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('metadata', JSON.stringify(metadata))
    formData.append('rights_confirmed', 'true')
    files.forEach((file) => formData.append('files', file))
    try {
      await api.post(`/digital-collections/collections/${selectedId}/objects`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFiles([])
      setMetadata([])
      setRightsConfirmed(false)
      if (fileInput.current) fileInput.current.value = ''
      await loadObjects(selectedId)
      toast.success('Files added to the collection')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not upload files')
    } finally {
      setUploading(false)
    }
  }

  async function setPublicStatus(object, isPublic) {
    try {
      await api.patch(`/digital-collections/objects/${object.object_id}`, { is_public: isPublic })
      await loadObjects(selectedId)
      toast.success(isPublic ? 'Object is now public' : 'Object is now private')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update access status')
    }
  }

  async function viewFile(object) {
    try {
      const { data } = await api.get(`/digital-collections/objects/${object.object_id}/file`, { responseType: 'blob' })
      const fileUrl = URL.createObjectURL(data)
      const preview = window.open(fileUrl, '_blank')
      if (!preview) {
        URL.revokeObjectURL(fileUrl)
        toast.error('Allow pop-ups to preview this file')
        return
      }
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not open digital object')
    }
  }

  async function deleteObject(object) {
    if (!window.confirm(`Delete “${object.title}” and its stored file?`)) return
    try {
      await api.delete(`/digital-collections/objects/${object.object_id}`)
      await loadObjects(selectedId)
      toast.success('Digital object deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete digital object')
    }
  }

  return (
    <div className="space-y-7 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Archives / Digital access</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Digital Collections</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">Organize digitized materials, document selection decisions, and control public access.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ShieldCheck size={18} className="text-emerald-700" />
          Rights review required for every upload
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={createCollection} className="space-y-4 border-y border-gray-200 py-5">
          <div className="flex items-center gap-2">
            <FolderPlus size={19} className="text-emerald-700" />
            <h2 className="text-lg font-bold text-gray-900">Create a collection</h2>
          </div>
          <label className="block text-sm font-semibold text-gray-700">Collection name
            <input required maxLength={255} value={collectionForm.title} onChange={(event) => setCollectionForm({ ...collectionForm, title: event.target.value })} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 font-normal focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">Description
            <textarea value={collectionForm.description} onChange={(event) => setCollectionForm({ ...collectionForm, description: event.target.value })} rows={2} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 font-normal focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">Selection criteria
            <textarea required value={collectionForm.selection_criteria} onChange={(event) => setCollectionForm({ ...collectionForm, selection_criteria: event.target.value })} rows={3} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 font-normal focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">Collection value
            <textarea required value={collectionForm.collection_value} onChange={(event) => setCollectionForm({ ...collectionForm, collection_value: event.target.value })} rows={3} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 font-normal focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15" />
          </label>
          <button disabled={savingCollection} className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">
            <Plus size={17} /> {savingCollection ? 'Creating…' : 'Create collection'}
          </button>
        </form>

        <div className="space-y-5 border-y border-gray-200 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Collection contents</h2>
              <p className="mt-1 text-sm text-gray-500">Select a collection, then add up to 15 PDF or image files at once.</p>
            </div>
            <select aria-label="Choose collection" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={!collections.length} className="min-w-52 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm">
              {collections.length ? collections.map((collection) => <option key={collection.collection_id} value={collection.collection_id}>{collection.title}</option>) : <option value="">No collections yet</option>}
            </select>
          </div>

          {selectedCollection && <p className="border-l-2 border-emerald-700 pl-3 text-sm text-gray-600">{selectedCollection.description || 'No collection description.'}</p>}

          <form onSubmit={uploadBatch} className="space-y-4">
            <button type="button" disabled={!selectedId} onClick={() => fileInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); acceptFiles(event.dataTransfer.files) }} className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-5 text-sm text-gray-600 hover:border-emerald-700 hover:bg-emerald-50/40 disabled:opacity-50">
              <Upload size={22} className="text-emerald-800" />
              <span className="font-semibold">Drop files here or choose files</span>
              <span className="text-xs">PDF, PNG, JPEG · Up to 15 per batch</span>
            </button>
            <input ref={fileInput} type="file" accept={allowedFileTypes} multiple className="hidden" onChange={(event) => acceptFiles(event.target.files)} />

            {files.map((file, index) => (
              <article key={`${file.name}-${index}`} className="space-y-3 border-b border-gray-200 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {file.type === 'application/pdf' ? <FileText size={18} className="shrink-0 text-rose-700" /> : <FileImage size={18} className="shrink-0 text-emerald-700" />}
                    <span className="truncate text-sm font-semibold text-gray-800">{file.name}</span>
                    <span className="shrink-0 text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <button type="button" title="Remove file" onClick={() => removeFile(index)} className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={17} /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-gray-600">Title
                    <input required value={metadata[index].title} onChange={(event) => updateMetadata(index, 'title', event.target.value)} className="mt-1 w-full rounded border border-gray-300 px-2.5 py-2 text-sm font-normal" />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">Creator
                    <input value={metadata[index].creator} onChange={(event) => updateMetadata(index, 'creator', event.target.value)} className="mt-1 w-full rounded border border-gray-300 px-2.5 py-2 text-sm font-normal" />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">Material type
                    <select value={metadata[index].material_type} onChange={(event) => updateMetadata(index, 'material_type', event.target.value)} className="mt-1 w-full rounded border border-gray-300 bg-white px-2.5 py-2 text-sm font-normal">{materialTypes.map((type) => <option key={type}>{type}</option>)}</select>
                  </label>
                  <label className="text-xs font-semibold text-gray-600">Rights status
                    <select value={metadata[index].rights_status} onChange={(event) => updateMetadata(index, 'rights_status', event.target.value)} className="mt-1 w-full rounded border border-gray-300 bg-white px-2.5 py-2 text-sm font-normal">{rightsStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                  </label>
                  <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Rights assessment notes
                    <textarea required rows={2} value={metadata[index].rights_assessment_notes} onChange={(event) => updateMetadata(index, 'rights_assessment_notes', event.target.value)} placeholder="Record the basis for this rights decision" className="mt-1 w-full rounded border border-gray-300 px-2.5 py-2 text-sm font-normal" />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
                    <input type="checkbox" checked={metadata[index].is_public} onChange={(event) => updateMetadata(index, 'is_public', event.target.checked)} disabled={metadata[index].rights_status === 'Sensitive - Restricted'} className="size-4 accent-emerald-800" />
                    Publicly accessible {metadata[index].rights_status === 'Sensitive - Restricted' && <span className="text-xs text-rose-700">(restricted items stay private)</span>}
                  </label>
                </div>
              </article>
            ))}

            {files.length > 0 && <>
              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-0.5 size-4 accent-emerald-800" />
                <span>I confirm that I completed and documented a rights assessment for every file in this batch.</span>
              </label>
              <button disabled={uploading || !rightsConfirmed} className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50">
                <Upload size={17} /> {uploading ? 'Uploading…' : `Upload ${files.length} ${files.length === 1 ? 'file' : 'files'}`}
              </button>
            </>}
          </form>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Digital objects</h2>
          <span className="text-sm text-gray-500">{objects.length} {objects.length === 1 ? 'item' : 'items'}</span>
        </div>
        <div className="overflow-x-auto border-y border-gray-200">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600"><tr><th className="px-4 py-3">Title / creator</th><th className="px-4 py-3">Material</th><th className="px-4 py-3">Rights</th><th className="px-4 py-3">Access</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading collections…</td></tr> : objects.length ? objects.map((object) => <tr key={object.object_id}>
                <td className="px-4 py-3"><div className="font-semibold text-gray-900">{object.title}</div><div className="text-xs text-gray-500">{object.creator || 'Creator not recorded'}</div></td>
                <td className="px-4 py-3 text-gray-700">{object.material_type}</td>
                <td className="px-4 py-3"><div className="text-gray-800">{object.rights_status}</div><div className="max-w-xs truncate text-xs text-gray-500" title={object.rights_assessment_notes}>{object.rights_assessment_notes}</div></td>
                <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 font-medium ${object.is_public ? 'text-emerald-800' : 'text-gray-600'}`}>{object.is_public ? <ShieldCheck size={15} /> : <LockKeyhole size={15} />}{object.is_public ? 'Public' : 'Private'}</span></td>
                <td className="px-4 py-3 text-right"><div className="inline-flex items-center gap-3"><button type="button" onClick={() => viewFile(object)} className="font-semibold text-emerald-800 hover:underline">View file</button><button type="button" onClick={() => setPublicStatus(object, !object.is_public)} className="font-semibold text-gray-700 hover:text-emerald-800">Make {object.is_public ? 'private' : 'public'}</button><button type="button" title="Delete object" onClick={() => deleteObject(object)} className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={16} /></button></div></td>
              </tr>) : <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">{selectedId ? 'No digital objects in this collection yet.' : 'Create a collection to get started.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}