import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF3F0',
          100: '#FFE6E0',
          200: '#FFCCBF',
          300: '#FFB399',
          400: '#FF9973',
          500: '#FF7F50', // 실제 coral 색상
          600: '#FF6633', // hover 색상
          700: '#FF4D1A',
          800: '#FF3300',
          900: '#CC2900',
        },
      },
    },
  },
  plugins: [],
};

export default config;
