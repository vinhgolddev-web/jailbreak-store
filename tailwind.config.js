/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            screens: {
                'sm': '576px',  // Mobile Landscape / Large Phones
                // 'md': '768px', // Default
                'lg': '992px',  // Laptops / Small Desktops
                'xl': '1200px', // Large Desktops
            },
            colors: {
                background: '#0F1115', // Deep Gunmetal
                surface: '#181A20',    // Dark Gray Surface
                surfaceHighlight: '#23262F', // Lighter Surface
                primary: '#FF9F0A',    // Amber Orange
                primaryHover: '#FFB340', // Lighter Orange
                secondary: '#9CA3AF',  // Cool Gray Text
                accent: '#FF9F0A',     // Same as Primary for consistency
                success: '#22C55E',    // Green
                danger: '#EF4444',     // Red
                border: '#2A2D35',     // Subtle Border
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
};

export default config;
