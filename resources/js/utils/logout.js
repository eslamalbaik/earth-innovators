import { router } from '@inertiajs/react';

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
}

export function logout() {
    const logoutUrl = route('logout');
    const csrfToken = getCsrfToken();

    if (!logoutUrl || !csrfToken) {
        router.post(logoutUrl || '/logout');
        return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = logoutUrl;
    form.style.display = 'none';

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = '_token';
    tokenInput.value = csrfToken;
    form.appendChild(tokenInput);

    document.body.appendChild(form);
    form.submit();
}
