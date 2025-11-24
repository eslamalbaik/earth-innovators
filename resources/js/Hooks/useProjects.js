import { useQuery } from '@tanstack/react-query';
import { router } from '@inertiajs/react';

export function useProjects(filters = {}) {
    return useQuery({
        queryKey: ['projects', filters],
        queryFn: async () => {
            const response = await router.get('/projects', filters, {
                preserveState: true,
                preserveScroll: true,
            });
            return response;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useProject(id) {
    return useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const response = await router.get(`/projects/${id}`, {}, {
                preserveState: true,
            });
            return response;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

