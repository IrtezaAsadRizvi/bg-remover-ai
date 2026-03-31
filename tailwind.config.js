/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#2e2e38',
        panel: '#181922',
        'panel-alt': '#20202a',
        'label-text': '#64646e',
        cta: '#f75328',
        preview: '#f5f5f7',
      },
      backgroundImage: {
        checker:
          'linear-gradient(45deg, rgba(255,255,255,0.12) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.12) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.12) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.12) 75%)',
      },
      borderRadius: {
        sm: '2px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99, 102, 241, 0.1), 0 20px 40px -20px rgba(15, 23, 42, 0.35)',
        thumb: '0 0 0 2px #f75328',
      },
    },
  },
  plugins: [],
}
