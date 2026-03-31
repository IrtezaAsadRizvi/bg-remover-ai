import { useRef } from 'react'
import type { FC } from 'react'
import type { WorkerSettings } from '../workers/types'

type OptionsPanelProps = {
  settings: WorkerSettings
  statusLabel: string
  canRun: boolean
  onModelChange: (value: WorkerSettings['model']) => void
  onInputSizeChange: (value: WorkerSettings['inputSize']) => void
  onThresholdChange: (value: number) => void
  onFeatherChange: (value: number) => void
  onBackgroundColorChange: (value: string | null) => void
  onRemoveBackground: () => void
}

const OptionsPanel: FC<OptionsPanelProps> = ({
  settings,
  statusLabel,
  canRun,
  onModelChange,
  onInputSizeChange,
  onThresholdChange,
  onFeatherChange,
  onBackgroundColorChange,
  onRemoveBackground,
}) => {
  const displayColor = settings.backgroundColor ?? '#ffffff'
  const readableTextColor = (value: string | null) => {
    if (!value) return '#ffffff'
    const hex = value.replace('#', '')
    if (hex.length !== 3 && hex.length !== 6) return '#ffffff'
    const parse = (part: string) => Number.parseInt(part, 16)
    const r = hex.length === 3 ? parse(hex[0] + hex[0]) : parse(hex.slice(0, 2))
    const g = hex.length === 3 ? parse(hex[1] + hex[1]) : parse(hex.slice(2, 4))
    const b = hex.length === 3 ? parse(hex[2] + hex[2]) : parse(hex.slice(4, 6))
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6 ? '#000000' : '#ffffff'
  }
  const colorRef = useRef<HTMLInputElement | null>(null)
  return (
    <aside className="flex w-[320px] flex-col rounded bg-panel p-6">      
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <p className="text-xs font-semibold text-label-text">Model</p>
          <div className="relative mt-2">
            <select
              className="w-full appearance-none rounded border border-transparent bg-panel-alt px-3 py-2 pr-10 text-sm text-white transition hover:border-cta/30 focus:border-cta focus:outline-none"
              value={settings.model}
              onChange={(event) => onModelChange(event.target.value as WorkerSettings['model'])}
            >
              <option value="u2net-human">U^2-Net Human Seg</option>
              <option value="isnet-general">ISNet (General)</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/60">
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
                className="lucide lucide-chevron-down-icon lucide-chevron-down"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-label-text">
            <span>Input size</span>            
          </div>
          <div className="relative mt-2">
            <select
              className="w-full appearance-none rounded border border-transparent bg-panel-alt px-3 py-2 pr-10 text-sm text-white transition hover:border-cta/30 focus:border-cta focus:outline-none"
              value={settings.inputSize}
              onChange={(event) =>
                onInputSizeChange(Number(event.target.value) as WorkerSettings['inputSize'])
              }
            >
              <option value={320}>320px</option>
              <option value={512}>512px</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/60">
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
                className="lucide lucide-chevron-down-icon lucide-chevron-down"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-label-text">
            <span>Threshold</span>
            <span className='text-white'>{settings.threshold.toFixed(2)}</span>
          </div>
          <input
            className="mt-2 h-1 w-full appearance-none rounded-full bg-cta/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cta [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-thumb [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cta [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-thumb [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-cta/20"
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={settings.threshold}
            onChange={(event) => onThresholdChange(Number(event.target.value))}
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-label-text">
            <span>Feather</span>
            <span className='text-white'>{settings.feather}px</span>
          </div>
          <input
            className="mt-2 h-1 w-full appearance-none rounded-full bg-cta/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cta [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-thumb [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cta [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-thumb [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-cta/20"
            type="range"
            min={0}
            max={20}
            step={1}
            value={settings.feather}
            onChange={(event) => onFeatherChange(Number(event.target.value))}
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-label-text">
            <span>Background color</span>
          </div>
          <div className="mt-2 flex items-center gap-3 relative">
            <input
              className="absolute left-0 top-full mt-2 h-9 w-40 opacity-0"
              type="color"
              value={displayColor}
              onChange={(event) => onBackgroundColorChange(event.target.value)}
              aria-label="Pick background color"
              ref={colorRef}
            />
            <input
              className="flex-1 cursor-pointer rounded border border-transparent px-3 py-2 text-sm focus:outline-none"
              readOnly
              style={{
                backgroundColor: settings.backgroundColor || 'transparent',
                color: readableTextColor(settings.backgroundColor),
              }}
              value={settings.backgroundColor ?? 'Transparent'}
              onClick={() => colorRef.current?.click()}
            />
            <button
              className="rounded bg-panel-alt px-3 py-2 text-xs font-semibold text-white/70 transition hover:text-white"
              type="button"
              onClick={() => onBackgroundColorChange(null)}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <button
          className="w-full rounded bg-cta px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/10"
          disabled={!canRun}
          onClick={onRemoveBackground}
          type="button"
        >
          Remove Background
        </button>
        <p className="mt-3 text-xs text-white/50">Status: {statusLabel}</p>
      </div>
    </aside>
  )
}

export default OptionsPanel
