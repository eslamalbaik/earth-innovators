import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import WhatsAppSupportButton from '@/Components/Support/WhatsAppSupportButton';

export default function GuestLayout({ children }) {
    const { dir } = useSelector((state) => state.language);
    
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-[#A3C042]/5 to-[#A3C042]/10 sm:justify-center" dir={dir}>
            <div className='sm:py-4'>
                {children}
            </div>
            <WhatsAppSupportButton />
        </div>
    );
}
