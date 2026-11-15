/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#040711',
          900: '#090D1A',
          850: '#0E1426',
          800: '#141D33',
          700: '#1F2B48',
          600: '#2F3F66',
        },
        bio: {
          cyan: '#00F0FF',
          teal: '#14F195',
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          night: '#FF453A',
          violet: '#A855F7',
          blue: '#3B82F6',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -2px rgba(0, 240, 255, 0.4)',
        'glow-green': '0 0 20px -2px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 20px -2px rgba(245, 158, 11, 0.4)',
        'glow-red': '0 0 20px -2px rgba(239, 68, 68, 0.4)',
        'glow-night': '0 0 20px -2px rgba(255, 69, 58, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-heart': 'heartbeat 1.2s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.12)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.08)' },
          '60%': { transform: 'scale(1)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.98)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
}
