import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import type { WorkerRequest, WorkerResponse, WorkerSettings } from '../workers/types'
import OptionsPanel from './OptionsPanel'
import PreviewPane from './PreviewPane'
import UploadPanel from './UploadPanel'

const Tool = () => {
  const workerRef = useRef<Worker | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [originalCompareUrl, setOriginalCompareUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'Idle' | 'Working' | 'Done' | 'Error'>('Idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ message: string; value?: number } | null>(null)
  const [dimensions, setDimensions] = useState<{ width?: number; height?: number }>({})
  const [isDragging, setIsDragging] = useState(false)
  const [settings, setSettings] = useState<WorkerSettings>({
    inputSize: 320,
    threshold: 0.5,
    feather: 6,
    model: 'u2net-human',
    backgroundColor: null,
  })

  useEffect(() => {
    const worker = new Worker(new URL('../workers/bgWorker.ts', import.meta.url), {
      type: 'module',
    })

    const normalizeResult = async (blob: Blob) => {
      if (!dimensions.width || !dimensions.height) return blob
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = dimensions.width
      canvas.height = dimensions.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        bitmap.close()
        return blob
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      bitmap.close()
      const normalizedBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((next) => resolve(next ?? blob), 'image/png')
      })
      return normalizedBlob
    }

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type === 'DONE') {
        void normalizeResult(event.data.blob).then((normalized) => {
          const nextUrl = URL.createObjectURL(normalized)
          setResultUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return nextUrl
          })
          setStatus('Done')
          setError(null)
          setProgress(null)
        })
        return
      }

      if (event.data.type === 'PROGRESS') {
        setStatus('Working')
        setProgress({ message: event.data.message, value: event.data.value })
        return
      }

      if (event.data.type === 'ERROR') {
        setStatus('Error')
        setError(event.data.message)
        setProgress(null)
      }
    }

    worker.onerror = (event) => {
      setStatus('Error')
      setError(event.message || 'Worker failed to initialize.')
      setProgress(null)
    }

    worker.onmessageerror = () => {
      setStatus('Error')
      setError('Worker message could not be decoded.')
      setProgress(null)
    }

    workerRef.current = worker

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl)
      if (originalCompareUrl) URL.revokeObjectURL(originalCompareUrl)
      if (resultUrl) URL.revokeObjectURL(resultUrl)
    }
  }, [originalUrl, originalCompareUrl, resultUrl])

  const statusLabel = useMemo(() => {
    if (status === 'Error') return `Error${error ? `: ${error}` : ''}`
    if (status === 'Working' && progress?.message) return `Working: ${progress.message}`
    return status
  }, [status, error, progress])

  const setNewFile = (nextFile: File) => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (originalCompareUrl) URL.revokeObjectURL(originalCompareUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)

    const url = URL.createObjectURL(nextFile)
    setFile(nextFile)
    setOriginalUrl(url)
    setResultUrl(null)
    setStatus('Idle')
    setError(null)
    setProgress(null)
    setDimensions({})

    const img = new Image()
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height })
    }
    img.src = url

    createImageBitmap(nextFile)
      .then((bitmap) => {
        const canvas = document.createElement('canvas')
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(bitmap, 0, 0)
        bitmap.close()
        canvas.toBlob((blob) => {
          if (!blob) return
          const compareUrl = URL.createObjectURL(blob)
          setOriginalCompareUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return compareUrl
          })
        }, 'image/png')
      })
      .catch(() => undefined)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return
    if (!nextFile.type.startsWith('image/')) {
      setStatus('Error')
      setError('Please choose an image file.')
      return
    }
    setNewFile(nextFile)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const nextFile = event.dataTransfer.files?.[0]
    if (!nextFile) return
    if (!nextFile.type.startsWith('image/')) {
      setStatus('Error')
      setError('Please drop an image file.')
      return
    }
    setNewFile(nextFile)
  }

  const handleRemoveBackground = () => {
    if (!file || !workerRef.current) return
    const message: WorkerRequest = { type: 'PROCESS', file, settings }
    setStatus('Working')
    setError(null)
    setProgress({ message: 'Queued…', value: 0 })
    workerRef.current.postMessage(message)
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const link = document.createElement('a')
    link.href = resultUrl
    link.download = 'cutout.png'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleClear = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (originalCompareUrl) URL.revokeObjectURL(originalCompareUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null)
    setOriginalUrl(null)
    setOriginalCompareUrl(null)
    setResultUrl(null)
    setStatus('Idle')
    setError(null)
    setProgress(null)
    setDimensions({})
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const displayUrl = originalUrl ?? resultUrl
  const hasPreview = Boolean(file)
  const canRun = Boolean(file) && status !== 'Working'

  return (
    <div className="flex min-h-[calc(100vh-72px)] gap-6 px-6 py-6">
      <main className="relative flex flex-1 items-center justify-center">
        <div className="relative flex h-full w-full flex-col items-center justify-center p-8">
          {!hasPreview && (
            <UploadPanel
              isDragging={isDragging}
              onPick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            />
          )}

          {hasPreview && (
            <PreviewPane
              status={status}
              displayUrl={displayUrl}
              originalUrl={originalCompareUrl ?? originalUrl}
              resultUrl={resultUrl}
            />
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
        {status === 'Working' && (
          <div className="absolute bottom-8 left-1/2 w-[320px] -translate-x-1/2">
            <div className="rounded bg-panel px-4 py-3 text-xs text-white/80 shadow-lg">
              <div className="flex items-center justify-between">
                <span>{progress?.message ?? 'Working…'}</span>
                <span>{progress?.value ? `${Math.round(progress.value * 100)}%` : '—'}</span>
              </div>
              <div className="mt-2 h-2 rounded bg-white/10">
                <div
                  className="h-full rounded bg-white transition-all"
                  style={{ width: `${Math.round((progress?.value ?? 0) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
        {status === 'Done' && resultUrl && (
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-panel px-4 py-2 text-white shadow-lg">
            <button
              className="rounded-full p-2 text-white transition hover:text-cta"
              onClick={handleClear}
              type="button"
              aria-label="Remove image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-trash-icon lucide-trash"
              >
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
            <button
              className="rounded-full p-2 text-white transition hover:text-cta"
              onClick={handleDownload}
              type="button"
              aria-label="Export"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-download-icon lucide-download"
              >
                <path d="M12 15V3" />
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>
          </div>
        )}
      </main>

      <OptionsPanel
        settings={settings}
        statusLabel={statusLabel}
        canRun={canRun}
        onModelChange={(value) =>
          setSettings((prev) => ({
            ...prev,
            model: value,
          }))
        }
        onInputSizeChange={(value) =>
          setSettings((prev) => ({
            ...prev,
            inputSize: value,
          }))
        }
        onThresholdChange={(value) =>
          setSettings((prev) => ({
            ...prev,
            threshold: value,
          }))
        }
        onFeatherChange={(value) =>
          setSettings((prev) => ({
            ...prev,
            feather: value,
          }))
        }
        onBackgroundColorChange={(value) =>
          setSettings((prev) => ({
            ...prev,
            backgroundColor: value,
          }))
        }
        onRemoveBackground={handleRemoveBackground}
      />
    </div>
  )
}

export default Tool
