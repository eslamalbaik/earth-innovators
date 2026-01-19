import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Laravel Echo setup for real-time notifications
// Supports both Pusher and Socket.IO (Laravel Echo Server / Reverb)
(async () => {
    try {
        const EchoModule = await import('laravel-echo');
        const Echo = EchoModule.default || EchoModule;

        if (import.meta.env.VITE_ECHO_SERVER_URL || import.meta.env.VITE_ECHO_HOST) {
            try {
                const SocketIOModule = await import('socket.io-client');
                const io = SocketIOModule.default || SocketIOModule;

                const echoHost = import.meta.env.VITE_ECHO_HOST || window.location.hostname;
                const echoPort = import.meta.env.VITE_ECHO_PORT || '6001';
                const echoServerUrl = import.meta.env.VITE_ECHO_SERVER_URL || `http://${echoHost}:${echoPort}`;

                window.Echo = new Echo({
                    broadcaster: 'socket.io',
                    host: echoServerUrl,
                    client: io,
                    auth: {
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                        },
                    },
                    authEndpoint: '/broadcasting/auth',
                    enabledTransports: ['ws', 'wss'],
                });

                // Suppress connection errors in console
                let connectionAttempts = 0;
                const maxConnectionAttempts = 3;

                if (window.Echo.connector && window.Echo.connector.socket) {
                    window.Echo.connector.socket.on('connect', () => {
                        connectionAttempts = 0;
                        window.Echo._connectionErrorLogged = false;
                        if (import.meta.env.DEV) {
                            console.log('✅ Laravel Echo connected successfully');
                        }
                    });

                    window.Echo.connector.socket.on('disconnect', () => {
                        // Silent disconnect - will use polling fallback
                    });

                    window.Echo.connector.socket.on('error', () => {
                        // Silent error - will use polling fallback
                    });

                    window.Echo.connector.socket.on('connect_error', (error) => {
                        connectionAttempts++;
                        if (connectionAttempts <= maxConnectionAttempts && !window.Echo._connectionErrorLogged) {
                            if (import.meta.env.DEV) {
                                console.warn('⚠️ Laravel Echo connection failed, using polling fallback');
                            }
                            window.Echo._connectionErrorLogged = true;
                        }
                        // After max attempts, stop trying and use polling
                        if (connectionAttempts > maxConnectionAttempts) {
                            window.Echo.disconnect();
                            window.Echo = null;
                        }
                    });
                    
                    if (window.Echo.connector.socket.io) {
                        window.Echo.connector.socket.io.on('error', () => {
                            // Silent error
                        });
                    }
                }
            } catch (socketError) {
            }
        }

        if (!window.Echo && import.meta.env.VITE_PUSHER_APP_KEY) {
            try {
                const PusherModule = await import('pusher-js');
                const Pusher = PusherModule.default || PusherModule;

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

            } catch (pusherError) {
            }
        }
    } catch (error) {
        window.Echo = null;
    }
})();
