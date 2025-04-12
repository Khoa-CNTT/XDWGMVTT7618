/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      colors: {
        primary: "#B6282C", // Màu đỏ chủ đạo
        secondary: "#9333EA", // Màu tím
        danger: "#DC2626", // Màu đỏ
        customGray: "#6B7280", // Màu xám
      },
      fontFamily: {
        bungee: ["Bungee", "cursive"],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}

