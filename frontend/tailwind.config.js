/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nav: '#0f1b2d',
        nav2: '#1b2b44',
        bg: '#f4f6f9',
        sf: '#fff',
        tx: '#17202e',
        mu: '#5b6676',
        bd: '#dde2ea',
        pr: '#2563eb',
        prt: '#fff',
        ok: '#15803d',
        okb: '#dcfce7',
        wa: '#a16207',
        wab: '#fef3c7',
        cr: '#c2410c',
        crb: '#ffedd5',
        of: '#b91c1c',
        ofb: '#fee2e2',
        un: '#475569',
        unb: '#e2e8f0',
        ch: '#2563eb'
      },
    },
  },
  plugins: [],
}