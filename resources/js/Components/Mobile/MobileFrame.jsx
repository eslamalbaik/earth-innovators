import { useSelector } from 'react-redux';

export default function MobileFrame({ children }) {
    const { dir } = useSelector((state) => state.language);
    
    return (
        <div className="min-h-screen bg-gray-50" dir={dir}>
            {/* Mobile View - Phone Frame */}
            <div className="mx-auto w-full max-w-6xl px-0 md:px-6 py-0 md:py-8 md:hidden">
                <div className="mx-auto border border-gray-200 bg-white shadow-xl overflow-hidden">
                    <div className="bg-gray-50 min-h-screen">
                        {children}
                    </div>
                </div>
            </div>

            {/* Desktop View - Full Width Layout */}
            <div className="hidden md:block">
                <div className="min-h-screen">
                    {children}
                </div>
            </div>
        </div>
    );
}


