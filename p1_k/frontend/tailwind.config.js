/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#dae9ff',
          200: '#bad7ff',
          300: '#8fbfff',
          400: '#5d9bff',
          500: '#2f6eff',
          600: '#1e50e5',
          700: '#1840b2',
          800: '#163890',
          900: '#142f73',
        },
        ink: '#0f172a',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 25px 65px -35px rgba(47, 110, 255, 0.65)',
      },
    },
  },
  plugins: [],
}

