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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                    ? 'bg-gradient-to-r from-legacy-green to-legacy-blue text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            <Icon className={`text-lg ${isActive ? 'text-white' : 'text-gray-500'}`} />
            <span className="font-medium">{item.name}</span>
        </Link>
    );
}

