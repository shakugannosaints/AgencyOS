const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      colors: {
        agency: {
          ink: withOpacity('--agency-ink'),
          panel: withOpacity('--agency-panel'),
          border: withOpacity('--agency-border'),
          cyan: withOpacity('--agency-cyan'),
          magenta: withOpacity('--agency-magenta'),
          amber: withOpacity('--agency-amber'),
          muted: withOpacity('--agency-muted'),
        },
      },
      boxShadow: {
    panel: '0 0 0 1px rgba(7, 240, 255, 0.16), 0 10px 30px rgba(0, 0, 0, 0.26)',
    },
      keyframes: {
        emergency: {
          '0%, 100%': { filter: 'hue-rotate(0deg) saturate(1)' },
          '50%': { filter: 'hue-rotate(40deg) saturate(2)' },
        },
        pulseGrid: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.75 },
        },
      },
      animation: {
        emergency: 'emergency 0.8s linear infinite',
        pulseGrid: 'pulseGrid 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('win98', '[data-theme="win98"] &')
      addVariant('fluent', '[data-theme="fluent"] &')
    }
  ],
}

