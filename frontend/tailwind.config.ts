import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory:    'oklch(97% 0.012 65)',
        cream:    'oklch(93% 0.018 65)',
        stone:    'oklch(86% 0.015 65)',
        charcoal: 'oklch(18% 0.01  60)',
        slate:    'oklch(45% 0.015 60)',
        mist:     'oklch(62% 0.012 60)',
        rose: {
          DEFAULT: 'oklch(55% 0.18 10)',
          light:   'oklch(70% 0.14 10)',
          pale:    'oklch(93% 0.04 10)',
          dark:    'oklch(38% 0.18 10)',
        },
        gold: {
          DEFAULT: 'oklch(72% 0.14 75)',
          pale:    'oklch(95% 0.04 75)',
        },
        // Legacy compat — kept so existing components don't break
        void:      '#0d111a',
        abyss:     '#101724',
        surface:   '#161c28',
        parchment: '#e9eef8',
        sand:      '#aab5c9',
        terracotta:'#d4a757',
        mahogany: {
          50: '#f0e4c8', 100: '#c8aa80', 200: '#b88832',
          800: '#231408', 900: '#1a0e07', 950: '#0d0705',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)',  'DM Sans', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)',  'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'rose-sm': '0 0 12px oklch(55% 0.18 10 / 0.18)',
        'rose-md': '0 0 30px oklch(55% 0.18 10 / 0.24)',
        'card':    '0 4px 20px oklch(18% 0.01 60 / 0.07)',
        'card-hover': '0 20px 60px oklch(18% 0.01 60 / 0.14)',
      },
      animation: {
        'fade-up':   'fadeUp 0.6s ease forwards',
        'shimmer':   'shimmer 2s ease infinite',
        'spin-slow': 'spin 1.5s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
    },
  },
  plugins: [],
}
export default config
