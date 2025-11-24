import { useQuery } from '@tanstack/react-query';
import { router } from '@inertiajs/react';

export function useTeachers(filters = {}) {
    return useQuery({
        queryKey: ['teachers', filters],
        queryFn: async () => {
            const response = await router.get('/teachers', filters, {
                preserveState: true,
                preserveScroll: true,
            });
            return response;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useTeacher(id) {
    return useQuery({
        queryKey: ['teacher', id],
        queryFn: async () => {
            const response = await router.get(`/teachers/${id}`, {}, {
                preserveState: true,
            });
            return response;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

