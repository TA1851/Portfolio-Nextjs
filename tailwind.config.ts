import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ダークモードを明示的に無効化
  darkMode: 'class', // クラス名でダークモードを制御
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
