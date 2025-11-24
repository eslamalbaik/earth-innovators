import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-legacy-green/10 to-legacy-blue/10 pt-6 sm:justify-center sm:pt-0" dir="rtl">
            <div>
                {children}
            </div>
        </div>
    );
}
