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
        // Core palette
        void: '#0d111a',
        abyss: '#101724',
        surface: '#161c28',
        card: '#1f2838',
        border: 'rgba(118,140,182,0.24)',

        // Primary accent family
        gold: {
          200: '#c7d3ff',
          300: '#9fb4ff',
          400: '#6a86ff',
          500: '#5471f5',
          600: '#3f5ed6',
          700: '#324aa8',
        },

        // Text
        parchment: '#e9eef8',
        sand: '#aab5c9',
        mist: '#7e8aa0',

        // Legacy compat (keep existing components working)
        mahogany: {
          50:  '#f0e4c8',
          100: '#c8aa80',
          200: '#b88832',
          800: '#231408',
          900: '#1a0e07',
          950: '#0d0705',
        },
        terracotta: '#d4a757',
        ivory:      '#f0e4c8',
        copper:     '#c8aa80',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)',  'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)',  'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-gradient':   'linear-gradient(135deg, #6a86ff 0%, #9fb4ff 50%, #6a86ff 100%)',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(106,134,255,0.18)',
        'gold-md': '0 0 30px rgba(106,134,255,0.24)',
        'gold-lg': '0 0 60px rgba(106,134,255,0.28)',
        'card':    '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(106,134,255,0.12)',
        'card-hover': '0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(106,134,255,0.18), 0 0 0 1px rgba(106,134,255,0.24)',
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'float-slow':     'float 9s ease-in-out infinite',
        'shimmer':        'shimmer 2.5s ease infinite',
        'fade-up':        'fadeUp 0.6s ease forwards',
        'glow-pulse':     'glowPulse 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 6s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
export default config
