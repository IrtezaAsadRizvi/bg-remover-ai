import type { FC } from 'react'

const TopBar: FC = () => {
  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-panel px-6 py-4">
      <div className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cta"
        >
          <line x1="2" x2="22" y1="2" y2="22" />
          <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
          <line x1="13.5" x2="6" y1="13.5" y2="21" />
          <line x1="18" x2="21" y1="12" y2="15" />
          <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
          <path d="M21 15V5a2 2 0 0 0-2-2H9" />
        </svg>
        <h1 className="text-lg font-semibold text-white">AI Background Remover</h1>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/IrtezaAsadRizvi/bg-remover-ai"
          target="_blank"
          rel="noreferrer"
          aria-label="View source on GitHub"
          className="text-white/70 transition hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </a>
        <a
          href="https://buymeacoffee.com/irtezaasad"
          target="_blank"
          rel="noreferrer"
          aria-label="Buy me a coffee"
          className="text-white/70 transition hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 2v2" />
            <path d="M14 2v2" />
            <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
            <path d="M6 2v2" />
          </svg>
        </a>
      </div>
    </header>
  )
}

export default TopBar
