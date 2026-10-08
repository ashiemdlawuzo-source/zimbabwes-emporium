import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'zimbabwe-flag':
          'linear-gradient(135deg, #009739 0%, #009739 33%, #FFD100 33%, #FFD100 66%, #D81E05 66%, #D81E05 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        zw: {
          green: {
            DEFAULT: '#009739',
            light: '#33bf65',
            dark: '#006a28',
            50: '#e6f5ec',
            100: '#c2e6d0',
            200: '#99d9b0',
            300: '#66cc8a',
            400: '#33bf65',
            500: '#009739',
            600: '#008031',
            700: '#006a28',
            800: '#004d1c',
            900: '#003313',
          },
          yellow: {
            DEFAULT: '#FFD100',
            light: '#ffeb66',
            dark: '#d9b000',
            50: '#fffce6',
            100: '#fff8cc',
            200: '#fff199',
            300: '#ffeb66',
            400: '#ffdd33',
            500: '#FFD100',
            600: '#d9b000',
            700: '#b39500',
            800: '#8c7400',
            900: '#665300',
          },
          red: {
            DEFAULT: '#D81E05',
            light: '#ee5a42',
            dark: '#a31604',
            50: '#fbe6e3',
            100: '#f5c4bd',
            200: '#ee9c91',
            300: '#e57464',
            400: '#de4b37',
            500: '#D81E05',
            600: '#b31904',
            700: '#8c1404',
            800: '#660f03',
            900: '#400a02',
          },
          black: '#0a0a0a',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
