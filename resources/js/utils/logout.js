import { router } from '@inertiajs/react';

export function logout() {
    router.post('/logout');
}
