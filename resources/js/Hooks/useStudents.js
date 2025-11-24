import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from '@inertiajs/react';
import axios from 'axios';

const API_BASE = '/school/students';

export function useStudents(search = '', page = 1) {
    return useQuery({
        queryKey: ['students', search, page],
        queryFn: async () => {
            const { data } = await axios.get(API_BASE, {
                params: { search, page },
            });
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCreateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (studentData) => {
            return router.post(API_BASE, studentData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}

export function useUpdateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...studentData }) => {
            return router.put(`${API_BASE}/${id}`, studentData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}

export function useDeleteStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            return router.delete(`${API_BASE}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}

export function useAwardBadge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ studentId, badgeId, reason }) => {
            return router.post(`${API_BASE}/${studentId}/badges`, {
                badge_id: badgeId,
                reason,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}

