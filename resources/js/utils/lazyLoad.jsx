import { lazy } from 'react';

// Lazy load pages
export const LazyDashboard = lazy(() => import('../Pages/Dashboard'));
export const LazyTeachers = lazy(() => import('../Pages/Teachers/Index'));
export const LazyProjects = lazy(() => import('../Pages/Projects/Index'));
export const LazyBookings = lazy(() => import('../Pages/Bookings/Index'));

// Lazy load components
export const LazyModal = lazy(() => import('../Components/Modal'));
export const LazyDataTable = lazy(() => import('../Components/DataTable'));

