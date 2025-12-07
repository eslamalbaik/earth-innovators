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
                sans: ['Tajawal', 'Figtree', ...defaultTheme.fontFamily.sans],
                tajawal: ['Tajawal', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e', // Main green from logo
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
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
