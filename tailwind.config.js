import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Dubai', 'Tajawal', 'Figtree', ...defaultTheme.fontFamily.sans],
                dubai: ['Dubai', 'sans-serif'],
                tajawal: ['Tajawal', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#fff4ed',
                    100: '#ffe4d4',
                    200: '#ffc5a8',
                    300: '#ff9d71',
                    400: '#ff6d38',
                    500: '#F88630', // Main orange color
                    600: '#e66a1f',
                    700: '#bf5019',
                    800: '#984019',
                    900: '#7a3716',
                },
                secondary: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#5A4FCF', // Secondary color - Purple
                    600: '#4c3fb8',
                    700: '#3d3296',
                    800: '#32287a',
                    900: '#2a2163',
                },
                brand: {
                    orange: '#F88630',
                    purple: '#5A4FCF',
                },
                legacy: {
                    green: '#22c55e',
                    blue: '#3b82f6',
                    white: '#ffffff',
                },
            },
            animation: {
                'slide-up': 'slideUp 0.3s ease-out',
                'slideInLeft': 'slideInLeft 0.4s ease-out',
                'fadeOut': 'fadeOut 0.3s ease-in',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(-100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
            },
        },
    },

    plugins: [forms],
};
