import type { FC } from 'react'
import { ImgComparisonSlider } from '@img-comparison-slider/react'

type PreviewPaneProps = {
    status: 'Idle' | 'Working' | 'Done' | 'Error'
    displayUrl: string | null
    originalUrl: string | null
    resultUrl: string | null
}

const PreviewPane: FC<PreviewPaneProps> = ({ status, displayUrl, originalUrl, resultUrl }) => {
  const showSlider = status === 'Done' && originalUrl && resultUrl

    return (
        <div className="relative w-fit">
            <div
                className={`flex h-[420px] w-fit items-center justify-center overflow-hidden ${showSlider ? 'bg-checker bg-[length:16px_16px]' : ''
                    } ${status === 'Working' ? 'blur-sm' : ''}`}
            >
        {showSlider ? (
          <ImgComparisonSlider className="comparison-slider h-full w-full">
            <img
              slot="first"
              src={originalUrl}
              alt="Original"
              className="h-[420px] w-full object-contain max-h-full"
              style={{ width: '100%', height: '100%' }}
            />
            <img
              slot="second"
              src={resultUrl}
              alt="Result"
              className="!h-[420px] w-full object-contain max-h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </ImgComparisonSlider>
        ) : displayUrl ? (
          <img src={displayUrl} alt="Preview" className="h-full w-full object-contain" />
        ) : (
          <p className="text-sm text-slate-500">Preview</p>
        )}
            </div>
        </div>
    )
}

export default PreviewPane
