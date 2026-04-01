/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        haven: {
          void:    '#080f0b',
          deep:    '#0d1a10',
          forest:  '#132318',
          green:   '#1e4a2c',
          mid:     '#2d6b40',
          sage:    '#5f8c6e',
          mist:    '#a8c4b0',
          cream:   '#f4ede0',
          ivory:   '#faf6ef',
          gold:    '#c9943a',
          amber:   '#e8b04a',
          warm:    '#f0c878',
          blush:   '#e8d5bc',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body:    ['Source Serif 4', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'waveform':    'waveform 2s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'pulse-gold':  'pulse-gold 3s ease-in-out infinite',
        'fade-up':     'fade-up 0.8s ease-out forwards',
        'fade-in':     'fade-in 1s ease-out forwards',
        'grain':       'grain 8s steps(10) infinite',
      },
      keyframes: {
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%':      { transform: 'scaleY(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.02)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%':      { transform: 'translate(-2%, -2%)' },
          '20%':      { transform: 'translate(2%, 2%)' },
          '30%':      { transform: 'translate(-1%, 1%)' },
          '40%':      { transform: 'translate(1%, -1%)' },
          '50%':      { transform: 'translate(-2%, 1%)' },
          '60%':      { transform: 'translate(2%, -2%)' },
          '70%':      { transform: 'translate(-1%, -1%)' },
          '80%':      { transform: 'translate(1%, 2%)' },
          '90%':      { transform: 'translate(-2%, 2%)' },
        },
      },
    },
  },
  plugins: [],
}
