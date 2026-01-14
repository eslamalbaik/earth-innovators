import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-[#A3C042]/5 to-[#A3C042]/10 sm:justify-center" dir="rtl">
            <div className='sm:py-4'>
                {children}
            </div>
        </div>
    );
}
