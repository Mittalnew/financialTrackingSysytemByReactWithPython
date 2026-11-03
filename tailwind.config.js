/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14201c',
          muted: '#5c6b64',
        },
        sage: {
          DEFAULT: '#e7efe9',
          deep: '#d5e4da',
        },
        brand: {
          DEFAULT: '#0b7a6e',
          dark: '#086057',
          soft: '#d8f3ee',
          light: '#d8f3ee',
        },
        coral: {
          DEFAULT: '#d97757',
          soft: '#f8e6df',
        },
      },
      boxShadow: {
        panel: '0 1px 0 rgba(20, 32, 28, 0.04), 0 12px 32px rgba(20, 32, 28, 0.06)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.2s infinite',
      },
    },
  },
  plugins: [],
}
