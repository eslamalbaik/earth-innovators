import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from '@inertiajs/react';

export function useBookings(filters = {}) {
    return useQuery({
        queryKey: ['bookings', filters],
        queryFn: async () => {
            const response = await router.get('/bookings', filters, {
                preserveState: true,
                preserveScroll: true,
            });
            return response;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes for bookings
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (data) => {
            return router.post('/bookings', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
}

export function useUpdateBookingStatus() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ id, status }) => {
            return router.put(`/bookings/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
}

