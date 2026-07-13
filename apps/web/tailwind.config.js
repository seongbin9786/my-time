/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          '"SFMono-Regular"',
          '"Cascadia Code"',
          '"Roboto Mono"',
          'ui-monospace',
          'monospace',
        ],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: true, // NOTE: 모든 DaisyUI 테마 활성화
  },
};
