export type WorkerSettings = {
  inputSize: 320 | 512
  threshold: number
  feather: number
  model: 'u2net-human' | 'isnet-general'
  backgroundColor: string | null
}

export type WorkerRequest =
  | {
      type: 'PROCESS'
      file: File
      settings: WorkerSettings
    }
  | {
      type: 'WARMUP'
    }

export type WorkerResponse =
  | {
      type: 'DONE'
      blob: Blob
    }
  | {
      type: 'PROGRESS'
      message: string
      value?: number
    }
  | {
      type: 'ERROR'
      message: string
    }
