import * as ort from 'onnxruntime-web/wasm'
import type { WorkerRequest, WorkerResponse, WorkerSettings } from './types'

const MODEL_URLS: Record<WorkerSettings['model'], string> = {
  'u2net-human': '/models/u2net-human.onnx',
  'isnet-general': '/models/isnet-general.onnx',
}
const MODEL_DEFAULT_INPUT: Record<WorkerSettings['model'], number> = {
  'u2net-human': 320,
  'isnet-general': 1024,
}
const DEFAULT_SETTINGS: WorkerSettings = {
  inputSize: 320,
  threshold: 0.5,
  feather: 6,
  model: 'u2net-human',
  backgroundColor: null,
}

const sessionCache = new Map<WorkerSettings['model'], Promise<ort.InferenceSession>>()

const postProgress = (message: string, value?: number) => {
  const payload: WorkerResponse = { type: 'PROGRESS', message, value }
  self.postMessage(payload)
}

const clamp = (value: number, min: number, max: number) => {
  if (value < min) return min
  if (value > max) return max
  return value
}

const parseHexColor = (value: string | null) => {
  if (!value) return null
  const hex = value.replace('#', '').trim()
  if (hex.length === 3) {
    const r = Number.parseInt(hex[0] + hex[0], 16)
    const g = Number.parseInt(hex[1] + hex[1], 16)
    const b = Number.parseInt(hex[2] + hex[2], 16)
    return { r, g, b }
  }
  if (hex.length === 6) {
    const r = Number.parseInt(hex.slice(0, 2), 16)
    const g = Number.parseInt(hex.slice(2, 4), 16)
    const b = Number.parseInt(hex.slice(4, 6), 16)
    return { r, g, b }
  }
  return null
}

const sigmoid = (value: number) => 1 / (1 + Math.exp(-value))

const loadSession = async (model: WorkerSettings['model']) => {
  postProgress('Loading model…', 0.05)
  const wasmBase = new URL('/ort/', self.location.origin).toString()
  ort.env.wasm.wasmPaths = wasmBase
  ort.env.wasm.numThreads = 1
  const modelUrl = MODEL_URLS[model]
  const response = await fetch(modelUrl)
  if (!response.ok) {
    throw new Error(
      `Model not found at ${modelUrl}. Place the ONNX file in public/models.`,
    )
  }
  const arrayBuffer = await response.arrayBuffer()
  postProgress('Initializing runtime…', 0.15)
  return await ort.InferenceSession.create(arrayBuffer, {
    executionProviders: ['wasm'],
  })
}

const getSession = async (model: WorkerSettings['model']) => {
  if (!sessionCache.has(model)) {
    sessionCache.set(model, loadSession(model))
  }
  return await sessionCache.get(model)!
}

const createLetterboxedInput = (
  bitmap: ImageBitmap,
  inputSize: number,
): {
  imageData: ImageData
  scale: number
  padX: number
  padY: number
} => {
  if (typeof OffscreenCanvas === 'undefined') {
    throw new Error('OffscreenCanvas is required for worker processing.')
  }

  const canvas = new OffscreenCanvas(inputSize, inputSize)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    throw new Error('Unable to create a 2D canvas context.')
  }

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, inputSize, inputSize)

  const scale = Math.min(inputSize / bitmap.width, inputSize / bitmap.height)
  const drawWidth = Math.round(bitmap.width * scale)
  const drawHeight = Math.round(bitmap.height * scale)
  const padX = Math.round((inputSize - drawWidth) / 2)
  const padY = Math.round((inputSize - drawHeight) / 2)

  ctx.drawImage(bitmap, padX, padY, drawWidth, drawHeight)

  const imageData = ctx.getImageData(0, 0, inputSize, inputSize)
  return { imageData, scale, padX, padY }
}

const imageDataToTensor = (imageData: ImageData): ort.Tensor => {
  const { data, width, height } = imageData
  const floatData = new Float32Array(3 * width * height)
  const stride = width * height

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x
      const offset = idx * 4
      floatData[idx] = data[offset] / 255
      floatData[stride + idx] = data[offset + 1] / 255
      floatData[stride * 2 + idx] = data[offset + 2] / 255
    }
  }

  return new ort.Tensor('float32', floatData, [1, 3, height, width])
}

const extractMask = (tensor: ort.Tensor): { data: Float32Array; width: number; height: number } => {
  const dims = tensor.dims
  const tensorData = tensor.data as Float32Array
  const height = dims[dims.length - 2]
  const width = dims[dims.length - 1]

  const channelStride = width * height
  const channels = dims.length === 4 ? dims[1] : 1
  const mask = new Float32Array(width * height)

  let min = Infinity
  let max = -Infinity

  for (let i = 0; i < width * height; i += 1) {
    const value = tensorData[i + channelStride * Math.max(0, 0)]
    mask[i] = value
    if (value < min) min = value
    if (value > max) max = value
  }

  if (min < 0 || max > 1) {
    for (let i = 0; i < mask.length; i += 1) {
      mask[i] = sigmoid(mask[i])
    }
  } else if (channels > 1) {
    for (let i = 0; i < mask.length; i += 1) {
      mask[i] = clamp(mask[i], 0, 1)
    }
  }

  return { data: mask, width, height }
}

const sampleBilinear = (
  data: Float32Array,
  width: number,
  height: number,
  x: number,
  y: number,
) => {
  const x0 = clamp(Math.floor(x), 0, width - 1)
  const y0 = clamp(Math.floor(y), 0, height - 1)
  const x1 = clamp(x0 + 1, 0, width - 1)
  const y1 = clamp(y0 + 1, 0, height - 1)
  const dx = x - x0
  const dy = y - y0

  const i00 = data[y0 * width + x0]
  const i10 = data[y0 * width + x1]
  const i01 = data[y1 * width + x0]
  const i11 = data[y1 * width + x1]

  const i0 = i00 * (1 - dx) + i10 * dx
  const i1 = i01 * (1 - dx) + i11 * dx
  return i0 * (1 - dy) + i1 * dy
}

const boxBlur = (data: Float32Array, width: number, height: number, radius: number) => {
  if (radius <= 0) return data
  const kernelSize = radius * 2 + 1
  const temp = new Float32Array(width * height)
  const output = new Float32Array(width * height)

  for (let y = 0; y < height; y += 1) {
    let sum = 0
    for (let x = -radius; x <= radius; x += 1) {
      const clampedX = clamp(x, 0, width - 1)
      sum += data[y * width + clampedX]
    }
    for (let x = 0; x < width; x += 1) {
      temp[y * width + x] = sum / kernelSize
      const removeX = clamp(x - radius, 0, width - 1)
      const addX = clamp(x + radius + 1, 0, width - 1)
      sum += data[y * width + addX] - data[y * width + removeX]
    }
  }

  for (let x = 0; x < width; x += 1) {
    let sum = 0
    for (let y = -radius; y <= radius; y += 1) {
      const clampedY = clamp(y, 0, height - 1)
      sum += temp[clampedY * width + x]
    }
    for (let y = 0; y < height; y += 1) {
      output[y * width + x] = sum / kernelSize
      const removeY = clamp(y - radius, 0, height - 1)
      const addY = clamp(y + radius + 1, 0, height - 1)
      sum += temp[addY * width + x] - temp[removeY * width + x]
    }
  }

  return output
}

const buildAlphaMask = (
  mask: Float32Array,
  maskWidth: number,
  maskHeight: number,
  width: number,
  height: number,
  inputSize: number,
  scale: number,
  padX: number,
  padY: number,
  threshold: number,
) => {
  const alpha = new Float32Array(width * height)
  const normalizedThreshold = clamp(threshold, 0.05, 0.95)
  const maskScaleX = maskWidth / inputSize
  const maskScaleY = maskHeight / inputSize

  for (let y = 0; y < height; y += 1) {
    const mappedY = (y * scale + padY) * maskScaleY
    for (let x = 0; x < width; x += 1) {
      const mappedX = (x * scale + padX) * maskScaleX
      const prob = sampleBilinear(mask, maskWidth, maskHeight, mappedX, mappedY)
      const soft = (prob - normalizedThreshold) / (1 - normalizedThreshold)
      alpha[y * width + x] = clamp(soft, 0, 1)
    }
  }

  return alpha
}

const applyAlphaToCanvas = async (
  bitmap: ImageBitmap,
  alpha: Float32Array,
  width: number,
  height: number,
  backgroundColor: string | null,
) => {
  if (typeof OffscreenCanvas === 'undefined') {
    throw new Error('OffscreenCanvas is required for worker processing.')
  }
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    throw new Error('Unable to create a 2D canvas context.')
  }

  ctx.drawImage(bitmap, 0, 0, width, height)
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const bg = parseHexColor(backgroundColor)
  if (bg) {
    for (let i = 0; i < alpha.length; i += 1) {
      const a = clamp(alpha[i], 0, 1)
      const inv = 1 - a
      const base = i * 4
      data[base] = Math.round(data[base] * a + bg.r * inv)
      data[base + 1] = Math.round(data[base + 1] * a + bg.g * inv)
      data[base + 2] = Math.round(data[base + 2] * a + bg.b * inv)
      data[base + 3] = 255
    }
  } else {
    for (let i = 0; i < alpha.length; i += 1) {
      data[i * 4 + 3] = Math.round(clamp(alpha[i], 0, 1) * 255)
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return await canvas.convertToBlob({ type: 'image/png' })
}

const normalizeSettings = (settings?: WorkerSettings): WorkerSettings => {
  if (!settings) return { ...DEFAULT_SETTINGS }
  return {
    inputSize: settings.inputSize === 512 ? 512 : 320,
    threshold: clamp(settings.threshold, 0.1, 0.9),
    feather: clamp(Math.round(settings.feather), 0, 20),
    model: settings.model === 'isnet-general' ? 'isnet-general' : 'u2net-human',
    backgroundColor: settings.backgroundColor ?? null,
  }
}

const getModelInputSize = (session: ort.InferenceSession) => {
  const inputName = session.inputNames[0]
  const metadata = (
    session.inputMetadata as unknown as
      | Record<string, { dimensions?: Array<number | string | bigint | null> }>
      | undefined
  )?.[inputName]
  const dims = metadata?.dimensions
  if (!dims || dims.length < 4) return null
  const height = typeof dims[2] === 'number' ? dims[2] : null
  const width = typeof dims[3] === 'number' ? dims[3] : null
  if (!height || !width || height !== width) return null
  return height
}

const runInference = async (file: File, settings?: WorkerSettings) => {
  postProgress('Preparing image…', 0.2)
  const activeSettings = normalizeSettings(settings)
  const session = await getSession(activeSettings.model)
  const modelInputSize = getModelInputSize(session)
  const inputSize =
    modelInputSize ?? MODEL_DEFAULT_INPUT[activeSettings.model] ?? activeSettings.inputSize
  if (modelInputSize && modelInputSize !== activeSettings.inputSize) {
    postProgress(`Model expects ${modelInputSize}px. Using that size.`, 0.25)
  } else if (!modelInputSize && inputSize !== activeSettings.inputSize) {
    postProgress(`Model expects ${inputSize}px. Using that size.`, 0.25)
  }
  const bitmap = await createImageBitmap(file)

  const { imageData, scale, padX, padY } = createLetterboxedInput(
    bitmap,
    inputSize,
  )
  const tensor = imageDataToTensor(imageData)
  postProgress('Running model…', 0.45)
  const feeds: Record<string, ort.Tensor> = {}
  feeds[session.inputNames[0]] = tensor

  const results = await session.run(feeds)
  postProgress('Refining mask…', 0.7)
  const output = results[session.outputNames[0]] as ort.Tensor
  if (!output) {
    throw new Error('Model output is missing.')
  }

  const { data: maskData, width: maskWidth, height: maskHeight } = extractMask(output)

  const alpha = buildAlphaMask(
    maskData,
    maskWidth,
    maskHeight,
    bitmap.width,
    bitmap.height,
    inputSize,
    scale,
    padX,
    padY,
    activeSettings.threshold,
  )

  const blurredAlpha = activeSettings.feather
    ? boxBlur(alpha, bitmap.width, bitmap.height, activeSettings.feather)
    : alpha

  postProgress('Compositing PNG…', 0.9)
  const blob = await applyAlphaToCanvas(
    bitmap,
    blurredAlpha,
    bitmap.width,
    bitmap.height,
    activeSettings.backgroundColor,
  )
  bitmap.close()
  return blob
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type === 'WARMUP') {
    try {
      await getSession(DEFAULT_SETTINGS.model)
      const message: WorkerResponse = { type: 'DONE', blob: new Blob() }
      self.postMessage(message)
    } catch (error) {
      const message: WorkerResponse = {
        type: 'ERROR',
        message: error instanceof Error ? error.message : 'Warmup failed.',
      }
      self.postMessage(message)
    }
    return
  }

  if (event.data.type !== 'PROCESS') return

  try {
    const blob = await runInference(event.data.file, event.data.settings)
    const message: WorkerResponse = { type: 'DONE', blob }
    self.postMessage(message)
  } catch (error) {
    const message: WorkerResponse = {
      type: 'ERROR',
      message: error instanceof Error ? error.message : 'Worker failed.',
    }
    self.postMessage(message)
  }
}
