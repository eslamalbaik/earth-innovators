import { Link } from '@inertiajs/react';

/**
 * Reusable Sidebar Item Component
 * Provides consistent styling and active state management
 */
export default function SidebarItem({ item, isActive, onClick }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                    ? 'bg-[#A3C042] text-white shadow-lg shadow-[#A3C042]/20'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            <Icon className={`text-lg ${isActive ? 'text-white' : 'text-gray-500'}`} />
            <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
        </Link>
    );
}

