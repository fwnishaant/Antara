/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        antara: {
          50: '#f4f7f6',
          100: '#e3eae7',
          200: '#c6d6d1',
          300: '#9ebaa4',
          400: '#719a95',
          500: '#537f7a',
          600: '#406562',
          700: '#345250',
          800: '#2c4342',
          900: '#111e1f',
          950: '#0a1213',
        },
        sand: {
          50: '#faf9f6',
          100: '#f3f1ec',
          200: '#e5e1d7',
          300: '#d3cbb9',
          400: '#beaf96',
          500: '#ab9579',
          800: '#4a3e31',
          900: '#261f18',
        },
        obsidian: {
          50: '#f6f7f9',
          100: '#eceef2',
          800: '#14171f',
          900: '#0d0f14',
          950: '#08090c',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['var(--font-serif)', 'Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'float': '0 12px 32px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'card': '0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px -2px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
