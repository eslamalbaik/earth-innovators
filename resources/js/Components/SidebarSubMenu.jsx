import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * Reusable Sidebar SubMenu Component
 * Provides collapsible submenu functionality for nested navigation
 */
export default function SidebarSubMenu({ item, isActive, currentUrl, onSubItemClick }) {
    const [isOpen, setIsOpen] = useState(() => {
        // Auto-open if any submenu item is active
        return item.subItems?.some(subItem => {
            if (currentUrl === subItem.href) return true;
            if (subItem.href.includes('/create') && currentUrl === subItem.href) return true;
            if (subItem.href.includes('/pending') && (currentUrl === subItem.href || currentUrl === subItem.href.replace('/pending', ''))) return true;
            return currentUrl.startsWith(subItem.href) && !subItem.href.includes('/dashboard');
        }) || false;
    });

    const Icon = item.icon;
    const hasActiveSubItem = item.subItems?.some(subItem => {
        if (currentUrl === subItem.href) return true;
        if (subItem.href.includes('/create') && currentUrl === subItem.href) return true;
        if (subItem.href.includes('/pending') && (currentUrl === subItem.href || currentUrl === subItem.href.replace('/pending', ''))) return true;
        return currentUrl.startsWith(subItem.href) && !subItem.href.includes('/dashboard');
    });

    return (
        <div>
            {/* Main Menu Item */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive || hasActiveSubItem
                        ? 'bg-gradient-to-r from-legacy-green to-legacy-blue text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
                <div className="flex items-center gap-3 flex-1">
                    <Icon className={`text-lg ${isActive || hasActiveSubItem ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.name}</span>
                </div>
                {isOpen ? (
                    <FaChevronUp className={`text-sm ${isActive || hasActiveSubItem ? 'text-white' : 'text-gray-500'}`} />
                ) : (
                    <FaChevronDown className={`text-sm ${isActive || hasActiveSubItem ? 'text-white' : 'text-gray-500'}`} />
                )}
            </button>

            {/* Submenu Items */}
            {isOpen && item.subItems && (
                <div className="mt-1 mr-4 space-y-1">
                    {item.subItems.map((subItem) => {
                        const isSubActive = (() => {
                            if (currentUrl === subItem.href) return true;
                            if (subItem.href.includes('/create')) {
                                return currentUrl === subItem.href;
                            }
                            if (subItem.href.includes('/pending')) {
                                return currentUrl === subItem.href || currentUrl === subItem.href.replace('/pending', '');
                            }
                            return currentUrl.startsWith(subItem.href) && !subItem.href.includes('/dashboard');
                        })();

                        return (
                            <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={onSubItemClick}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                    isSubActive
                                        ? 'bg-legacy-blue/20 text-legacy-blue font-semibold border-r-4 border-legacy-blue'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <subItem.icon className="text-base" />
                                <span className="text-sm">{subItem.name}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

