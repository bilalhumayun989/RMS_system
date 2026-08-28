export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Palette ────────────────────────────────────────────────
        // Background:  #F4F2F0  warm off-white
        // Cards:       #FFFFFF  white
        // Surface:     #ECEAE7  warm light gray
        // Text:        #1F221D  deep dark
        // Secondary:   #555754  muted gray-green
        // Orange:      #FF7A10  soft warm terracotta (main accent)
        // ──────────────────────────────────────────────────────────
        'pos-bg':       '#F4F2F0',
        'pos-card':     '#FFFFFF',
        'pos-surface':  '#ECEAE7',

        // Orange accent — full shade scale
        'pos-yellow':   '#FF7A10',   // base
        'pos-orange': {
          50:  '#FFF3E0',   // palest tint (bg highlights)
          100: '#FFE0B2',   // light tint (hover bg)
          200: '#FFCC80',   // medium tint (badges)
          300: '#FFB74D',   // soft (borders)
          400: '#FFA726',   // warm
          500: '#FF7A10',   // BASE accent
          600: '#E86000',   // hover
          700: '#CC5200',   // active / pressed
          800: '#A84300',
          900: '#8A3600',
        },

        'pos-green':    '#2E7D32',
        'pos-red':      '#C62828',
        'pos-blue':     '#1565C0',
        'pos-gray':     '#555754',
        'pos-primary':  '#1F221D',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
        '3xl': '1920px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 0.5s ease-in-out',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(31,34,29,0.06), 0 4px 16px rgba(31,34,29,0.06)',
      },
    },
  },
  plugins: [],
}
