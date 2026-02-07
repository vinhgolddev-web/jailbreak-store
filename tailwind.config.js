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
                background: '#050b14', // Deep Navy/Black (City Night)
                surface: '#0f1923',    // Game Card Bg
                surfaceHighlight: '#1a2733',
                primary: '#00eaff',    // Cyan (Police/Tech)
                secondary: '#ff2a6d',  // Neon Red/Pink (Criminal/Alert)
                accent: '#d1ff00',     // Neon Yellow (Warning/Money)
                success: '#00eaff',    // Cyan for success
                danger: '#ff2a6d',     // Red for danger
                border: '#1f2937',     // Dark Blue-Grey border
                text: '#e2e8f0',       // Light Grey text
                muted: '#94a3b8',      // Muted text
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['"Orbitron"', 'sans-serif'], // Connecting to the game vibe
            },
            boxShadow: {
                'neon-blue': '0 0 5px #00eaff, 0 0 10px #00eaff',
                'neon-red': '0 0 5px #ff2a6d, 0 0 10px #ff2a6d',
                'neon-yellow': '0 0 5px #d1ff00, 0 0 10px #d1ff00',
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
