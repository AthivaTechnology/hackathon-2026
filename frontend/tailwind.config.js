/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hack: {
          bg: '#0d0d14',
          surface: '#13131f',
          border: '#1e1e2e',
          cyan: '#22d3ee',
          violet: '#8b5cf6',
          green: '#4ade80',
          amber: '#fbbf24',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 24px rgba(34,211,238,0.25)',
        'glow-violet': '0 0 24px rgba(139,92,246,0.25)',
        'glow-green': '0 0 24px rgba(74,222,128,0.25)',
        'glow-amber': '0 0 24px rgba(251,191,36,0.25)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
