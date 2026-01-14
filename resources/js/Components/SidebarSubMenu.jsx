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
            // Extract path and query from URLs
            const getPath = (url) => {
                const [path] = url.split('?');
                return path;
            };
            
            const getQuery = (url) => {
                const [, query] = url.split('?');
                return query || '';
            };
            
            const subItemPath = getPath(subItem.href);
            const currentPath = getPath(currentUrl);
            const subItemQuery = getQuery(subItem.href);
            const currentQuery = getQuery(currentUrl);
            
            // Exact match (including query) always returns true
            if (currentUrl === subItem.href) return true;
            
            // If subItem has query parameters, match path and query
            if (subItemQuery) {
                if (currentPath !== subItemPath) return false;
                const subItemParams = new URLSearchParams(subItemQuery);
                const currentParams = new URLSearchParams(currentQuery);
                for (const [key, value] of subItemParams.entries()) {
                    if (currentParams.get(key) !== value) return false;
                }
                return true;
            }
            
            // If current URL has query parameters but subItem doesn't, only match if path matches exactly
            if (currentQuery && !subItemQuery) {
                return currentPath === subItemPath;
            }
            
            // Special handling for create routes - only match exact
            if (subItemPath.includes('/create')) {
                return currentPath === subItemPath;
            }
            
            // If current URL is a create route, don't match parent routes
            if (currentPath.includes('/create')) {
                return false;
            }
            
            // For dashboard routes, only match exact
            if (subItemPath.includes('/dashboard')) {
                return currentPath === subItemPath;
            }
            
            // For other routes, match if current URL starts with the subItem href
            return currentPath.startsWith(subItemPath) && !subItemPath.includes('/dashboard');
        }) || false;
    });

    const Icon = item.icon;
    const hasActiveSubItem = item.subItems?.some(subItem => {
        // Extract path and query from URLs
        const getPath = (url) => {
            const [path] = url.split('?');
            return path;
        };
        
        const getQuery = (url) => {
            const [, query] = url.split('?');
            return query || '';
        };
        
        const subItemPath = getPath(subItem.href);
        const currentPath = getPath(currentUrl);
        const subItemQuery = getQuery(subItem.href);
        const currentQuery = getQuery(currentUrl);
        
        // Exact match (including query) always returns true
        if (currentUrl === subItem.href) return true;
        
        // If subItem has query parameters, match path and query
        if (subItemQuery) {
            if (currentPath !== subItemPath) return false;
            const subItemParams = new URLSearchParams(subItemQuery);
            const currentParams = new URLSearchParams(currentQuery);
            for (const [key, value] of subItemParams.entries()) {
                if (currentParams.get(key) !== value) return false;
            }
            return true;
        }
        
        // If current URL has query parameters but subItem doesn't, only match if path matches exactly
        if (currentQuery && !subItemQuery) {
            return currentPath === subItemPath;
        }
        
        // Special handling for create routes - only match exact
        if (subItemPath.includes('/create')) {
            return currentPath === subItemPath;
        }
        
        // If current URL is a create route, don't match parent routes
        if (currentPath.includes('/create')) {
            return false;
        }
        
        // For dashboard routes, only match exact
        if (subItemPath.includes('/dashboard')) {
            return currentPath === subItemPath;
        }
        
        // For other routes, match if current URL starts with the subItem href
        return currentPath.startsWith(subItemPath) && !subItemPath.includes('/dashboard');
    });

    return (
        <div>
            {/* Main Menu Item */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive || hasActiveSubItem
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
                        const isSubActive = (() => {
                            // Extract path and query from URLs
                            const getPath = (url) => {
                                const [path] = url.split('?');
                                return path;
                            };
                            
                            const getQuery = (url) => {
                                const [, query] = url.split('?');
                                return query || '';
                            };
                            
                            const subItemPath = getPath(subItem.href);
                            const currentPath = getPath(currentUrl);
                            const subItemQuery = getQuery(subItem.href);
                            const currentQuery = getQuery(currentUrl);
                            
                            // Exact match (including query) always returns true
                            if (currentUrl === subItem.href) return true;
                            
                            // If subItem has query parameters, match path and query
                            if (subItemQuery) {
                                if (currentPath !== subItemPath) return false;
                                const subItemParams = new URLSearchParams(subItemQuery);
                                const currentParams = new URLSearchParams(currentQuery);
                                for (const [key, value] of subItemParams.entries()) {
                                    if (currentParams.get(key) !== value) return false;
                                }
                                return true;
                            }
                            
                            // If current URL has query parameters but subItem doesn't, only match if path matches exactly
                            if (currentQuery && !subItemQuery) {
                                return currentPath === subItemPath;
                            }
                            
                            // Special handling for create routes - only match exact
                            if (subItemPath.includes('/create')) {
                                return currentPath === subItemPath;
                            }
                            
                            // If current URL is a create route, don't match parent routes
                            if (currentPath.includes('/create')) {
                                return false;
                            }
                            
                            // For dashboard routes, only match exact
                            if (subItemPath.includes('/dashboard')) {
                                return currentPath === subItemPath;
                            }
                            
                            // For other routes, match if current URL starts with the subItem href
                            return currentPath.startsWith(subItemPath) && !subItemPath.includes('/dashboard');
                        })();

                        return (
                            <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={onSubItemClick}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                    isSubActive
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

