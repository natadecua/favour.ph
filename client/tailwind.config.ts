import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'favour-blue':       '#0047CC',
        'favour-blue-light': '#EEF3FF',
        'favour-blue-mid':   '#D0DEFF',
        'favour-dark':       '#111827',
        'ink-700':           '#4B5563',
        'ink-400':           '#9CA3AF',
        'surface':           '#F3F4F6',
        'border-ui':         '#E5E7EB',
        'verify-green':      '#007A33',
        'green-light':       '#ECFDF0',
        'green-border':      '#A7F3C0',
        'danger':            '#D92121',
        'amber':             '#B36B00',
        'amber-light':       '#FFF8E7',
        'amber-border':      '#FCD34D',
      },
      fontFamily: {
        sans:  ['var(--font-manrope)', 'sans-serif'],
        body:  ['var(--font-figtree)', 'sans-serif'],
        mono:  ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        card:   '12px',
        input:  '8px',
        btn:    '10px',
        pill:   '6px',
      },
      borderWidth: {
        DEFAULT: '1.5px',
        ui:      '1.5px',
      },
      height: {
        btn: '52px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
}

export default config
