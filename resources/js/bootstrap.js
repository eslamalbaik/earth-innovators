import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Laravel Echo setup for real-time notifications
(async () => {
    try {
        const EchoModule = await import('laravel-echo');
        const PusherModule = await import('pusher-js');
        
        const Echo = EchoModule.default || EchoModule;
        const Pusher = PusherModule.default || PusherModule;

        // Only initialize Echo if Pusher credentials are available
        if (import.meta.env.VITE_PUSHER_APP_KEY) {
            window.Pusher = Pusher;

            window.Echo = new Echo({
                broadcaster: 'pusher',
                key: import.meta.env.VITE_PUSHER_APP_KEY,
                cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
                forceTLS: true,
                encrypted: true,
                authEndpoint: '/broadcasting/auth',
                auth: {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    },
                },
            });
            
            console.log('Laravel Echo initialized with Pusher');
        } else {
            // Fallback: Use polling if Pusher is not configured
            console.warn('Pusher not configured. Real-time notifications will use polling.');
            window.Echo = null;
        }
    } catch (error) {
        console.warn('Failed to initialize Laravel Echo:', error);
        console.warn('Real-time notifications will use polling instead.');
        window.Echo = null;
    }
})();
