import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  important: true,
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        background: 'rgb(var(--background-start-rgb))',
        foreground: 'rgb(var(--foreground-rgb))',
      },
      fontFamily: {
        amelia: ['"Amelia UP W03 Regular"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
