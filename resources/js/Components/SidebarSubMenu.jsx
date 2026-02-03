import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * Reusable Sidebar SubMenu Component
 * Provides collapsible submenu functionality for nested navigation
 */
export default function SidebarSubMenu({ item, isActive, currentUrl, onSubItemClick }) {
    const checkIsActive = (href, currentUrl) => {
        if (!href || !currentUrl) return false;

        const getPath = (url) => {
            const [path] = url.split('?');
            return path;
        };

        const getQuery = (url) => {
            const [, query] = url.split('?');
            return query || '';
        };

        const hrefPath = getPath(href);
        const currentPath = getPath(currentUrl);
        const hrefQuery = getQuery(href);
        const currentQuery = getQuery(currentUrl);

        // Exact match
        if (currentUrl === href) return true;

        // If query params exist in item's href, match them
        if (hrefQuery) {
            if (currentPath !== hrefPath) return false;
            const hrefParams = new URLSearchParams(hrefQuery);
            const currentParams = new URLSearchParams(currentQuery);
            for (const [key, value] of hrefParams.entries()) {
                if (currentParams.get(key) !== value) return false;
            }
            return true;
        }

        // If current URL has queries but item doesn't
        if (currentQuery && !hrefQuery) {
            return currentPath === hrefPath;
        }

        // Special handling for dashboard/create/pending
        if (hrefPath.includes('/dashboard') || hrefPath.includes('/create') || hrefPath.includes('/pending')) {
            return currentPath === hrefPath;
        }

        // Parent routes shouldn't be active if we are on a create or pending page
        if (currentPath.includes('/create') || currentPath.includes('/pending')) {
            return currentPath === hrefPath;
        }

        // For other routes, only match if current URL starts with hrefPath as a segment
        return currentPath === hrefPath || currentPath.startsWith(hrefPath + '/');
    };

    const hasActiveSubItem = item.subItems?.some(subItem => checkIsActive(subItem.href, currentUrl)) || false;
    const [isOpen, setIsOpen] = useState(hasActiveSubItem);

    const Icon = item.icon;

    return (
        <div>
            {/* Main Menu Item */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive || hasActiveSubItem
                    ? 'bg-[#A3C042] text-white shadow-lg shadow-[#A3C042]/20'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
            >
                <div className="flex items-center gap-3 flex-1">
                    <Icon className={`text-lg ${isActive || hasActiveSubItem ? 'text-white' : 'text-gray-500'}`} />
                    <span className={`font-medium ${isActive || hasActiveSubItem ? 'font-semibold' : ''}`}>{item.name}</span>
                </div>
                {isOpen ? (
                    <FaChevronUp className={`text-sm ${isActive || hasActiveSubItem ? 'text-white' : 'text-gray-500'}`} />
                ) : (
                    <FaChevronDown className={`text-sm ${isActive || hasActiveSubItem ? 'text-white' : 'text-gray-500'}`} />
                )}
            </button>

            {/* Submenu Items */}
            {isOpen && item.subItems && (
                <div className="mt-2 ms-3 space-y-1">
                    {item.subItems.map((subItem) => {
                        const isSubActive = checkIsActive(subItem.href, currentUrl);

                        return (
                            <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={onSubItemClick}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isSubActive
                                    ? 'bg-[#A3C042]/10 text-[#A3C042] font-semibold'
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
