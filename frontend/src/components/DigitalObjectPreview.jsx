import React, { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
import { Download } from 'lucide-react'

const officeFormats = new Set(['csv', 'docx', 'md', 'pptx', 'rtf', 'xlsx'])
const formatByMimeType = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/rtf': 'rtf',
  'text/csv': 'csv',
  'text/markdown': 'md',
  'text/rtf': 'rtf',
}

function extensionOf(object) {
  return object.original_filename?.split('.').pop()?.toLowerCase() || formatByMimeType[object.mime_type] || ''
}

export default function DigitalObjectPreview({ object, url, loading = false, error = '', downloadUrl, onDownload }) {
  const [documentContent, setDocumentContent] = useState({ loading: false, html: '', text: '', error: '' })
  const extension = extensionOf(object)

  useEffect(() => {
    if (!url || (!officeFormats.has(extension) && object.mime_type !== 'text/plain')) {
      setDocumentContent({ loading: false, html: '', text: '', error: '' })
      return undefined
    }

    let active = true
    setDocumentContent({ loading: true, html: '', text: '', error: '' })

    async function loadDocument() {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('Could not read this document')
        const file = await response.blob()
        if (object.mime_type === 'text/plain') {
          const text = await file.text()
          if (active) setDocumentContent({ loading: false, html: '', text, error: '' })
          return
        }
        const { OfficeParser } = await import('officeparser/slim')
        const ast = await OfficeParser.parseOffice(file, { fileType: extension, extractAttachments: true })
        const { value } = await ast.to('html')
        if (active) setDocumentContent({ loading: false, html: DOMPurify.sanitize(value), text: '', error: '' })
      } catch {
        if (active) setDocumentContent({ loading: false, html: '', text: '', error: 'This document could not be rendered. You can still download the original file.' })
      }
    }

    loadDocument()
    return () => { active = false }
  }, [extension, object.mime_type, url])

  if (loading || documentContent.loading) return <p className="text-sm text-gray-600">Loading preview…</p>
  if (error) return <p role="alert" className="text-sm text-rose-700">{error}</p>
  if (object.mime_type === 'application/pdf') return <iframe title={object.title} src={url} className="h-[75vh] w-full bg-white" />
  if (object.mime_type?.startsWith('image/')) return <img src={url} alt={object.title} className="max-h-[75vh] max-w-full object-contain" />
  if (object.mime_type?.startsWith('video/')) return <video src={url} controls playsInline className="max-h-[75vh] max-w-full" />
  if (object.mime_type?.startsWith('audio/')) return <audio src={url} controls className="w-full max-w-xl" />
  if (object.mime_type === 'text/plain') return <pre className="max-h-[75vh] w-full overflow-auto whitespace-pre-wrap bg-white p-5 text-left text-sm text-gray-800">{documentContent.text}</pre>
  if (documentContent.html) return <div className="digital-document-preview max-h-[75vh] w-full overflow-auto bg-white p-5" dangerouslySetInnerHTML={{ __html: documentContent.html }} />

  return <div className="space-y-3 p-8 text-center">
    <p className="text-sm text-gray-700">{documentContent.error || 'Preview is not available for this file type.'}</p>
    {onDownload
      ? <button type="button" onClick={() => onDownload(object)} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900"><Download size={15} />Download document</button>
      : downloadUrl && <a href={downloadUrl} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900" download><Download size={15} />Download document</a>}
  </div>
}

DigitalObjectPreview.propTypes = {
  object: PropTypes.shape({
    mime_type: PropTypes.string,
    original_filename: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  url: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  downloadUrl: PropTypes.string,
  onDownload: PropTypes.func,
}
