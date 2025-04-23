/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      colors: {
        primary: "#B6282C", // Màu đỏ chủ đạo
        primaryHover: "#D6474C",
        secondary: "#9333EA", // Màu tím
        danger: "#DC2626", // Màu đỏ
        customGray: "#6B7280", // Màu xám
      },
      fontFamily: {
        bungee: ["Bungee", "cursive"],
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        zoomIn: "zoomIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}

