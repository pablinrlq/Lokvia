import tailwindAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        forest: {
          50: '#E8F0EA',
          100: '#C8D9CC',
          200: '#A5C0AB',
          300: '#7EA88B',
          400: '#5A9070',
          500: '#3A7856',
          600: '#2A6045',
          700: '#1D4A35',
          800: '#133524',
          900: '#0D2B1E',
        },
        lime: {
          300: '#D4EF8A',
          400: '#C8E86A',
          500: '#AECF4A',
        },
        earth: {
          300: '#E0BF99',
          400: '#D4A97A',
          500: '#C08B5A',
        },
        // v2.0 — paleta editorial
        ink: {
          50: '#F2F0EC',
          100: '#D9D5CC',
          200: '#A8A092',
          300: '#7A7264',
          400: '#4E4738',
          500: '#322C20',
          600: '#241F15',
          700: '#19150E',
          800: '#100D08',
          900: '#080604',
        },
        rust: {
          50: '#FBEEE6',
          100: '#F5D4BF',
          200: '#E9A983',
          300: '#D88052',
          400: '#C45E2F',
          500: '#A8431B',
          600: '#883414',
          700: '#66270F',
          800: '#451B0A',
          900: '#2A1006',
        },
        sand: '#EFE9DD',
        cream: '#F5F3EE',
        bone: '#F9F6F0',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        editorial: '-0.025em',
        wider: '0.08em',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        card: '0 2px 8px rgba(13, 43, 30, 0.08), 0 0 0 1px rgba(13, 43, 30, 0.04)',
        'card-hover': '0 8px 24px rgba(13, 43, 30, 0.14)',
        glow: '0 0 20px rgba(200, 232, 106, 0.3)',
        editorial: '0 1px 0 rgba(50, 44, 32, 0.04), 0 12px 32px -8px rgba(50, 44, 32, 0.12)',
        rust: '0 0 32px -8px rgba(196, 94, 47, 0.45)',
      },
      backgroundImage: {
        'noise-soft': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.08'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(200, 232, 106, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(200, 232, 106, 0.5)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'slide-in': 'slide-in 0.4s ease forwards',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'count-up': 'count-up 0.4s ease forwards',
      },
    },
  },
  plugins: [tailwindAnimate],
}
