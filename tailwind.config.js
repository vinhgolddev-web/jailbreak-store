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
                background: '#000000', // True Black
                surface: '#111111',    // Dark Zinc
                surfaceHighlight: '#333333',
                primary: '#ffffff',    // White
                secondary: '#888888',  // Gray text
                accent: '#0070f3',     // Vercel Blue
                success: '#0070f3',    // Blue for success instead of green
                danger: '#e00',        // Red
                border: '#333333',     // Dark border
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
