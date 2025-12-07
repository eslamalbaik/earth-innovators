import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Laravel Echo setup for real-time notifications
// Supports both Pusher and Socket.IO (Laravel Echo Server / Reverb)
(async () => {
    try {
        const EchoModule = await import('laravel-echo');
        const Echo = EchoModule.default || EchoModule;

        // Try Socket.IO first (for Laravel Echo Server / Reverb)
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

                if (window.Echo.connector && window.Echo.connector.socket) {
                    window.Echo.connector.socket.on('connect', () => {
                        console.log('✅ Laravel Echo connected (Socket.IO):', echoServerUrl);
                    });

                    window.Echo.connector.socket.on('disconnect', () => {
                        console.warn('⚠️ Laravel Echo disconnected - notifications will use polling');
                    });

                    window.Echo.connector.socket.on('error', (error) => {
                        // Only log if it's not a connection refused error (server not running)
                        if (!error.message?.includes('ERR_CONNECTION_REFUSED') && 
                            !error.message?.includes('ECONNREFUSED')) {
                            console.error('❌ Laravel Echo error:', error);
                        } else {
                            console.warn('⚠️ Laravel Echo Server not running - notifications will use polling');
                        }
                    });

                    // Handle connection errors silently
                    window.Echo.connector.socket.on('connect_error', (error) => {
                        // Silently handle connection errors - polling will be used as fallback
                        // Only log once to avoid spam
                        if (!window.Echo._connectionErrorLogged) {
                            if (error.message?.includes('ERR_CONNECTION_REFUSED') || 
                                error.message?.includes('ECONNREFUSED')) {
                                console.warn('⚠️ Laravel Echo Server not running - notifications will use polling');
                                window.Echo._connectionErrorLogged = true;
                            } else {
                                console.warn('⚠️ Laravel Echo connection error:', error.message);
                                window.Echo._connectionErrorLogged = true;
                            }
                        }
                    });
                }

                console.log('🚀 Laravel Echo initialized with Socket.IO');
            } catch (socketError) {
                console.warn('⚠️ Socket.IO setup failed, trying Pusher...', socketError);
                // Fall through to Pusher
            }
        }

        // Fallback to Pusher if Socket.IO is not configured or failed
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

                console.log('🚀 Laravel Echo initialized with Pusher');
            } catch (pusherError) {
                console.warn('⚠️ Pusher setup failed:', pusherError);
            }
        }

        // If neither works, Echo will be null and polling will be used
        if (!window.Echo) {
            console.warn('⚠️ No broadcasting service configured. Real-time notifications will use polling.');
        }
    } catch (error) {
        console.error('❌ Failed to initialize Laravel Echo:', error);
        console.warn('⚠️ Real-time notifications will use polling instead.');
        window.Echo = null;
    }
})();
