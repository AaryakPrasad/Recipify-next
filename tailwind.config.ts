import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          900: 'var(--brown-900)',
          800: 'var(--brown-800)',
          700: 'var(--brown-700)',
          600: 'var(--brown-600)',
        },
      },
    },
  },
  plugins: [],
};
export default config;
