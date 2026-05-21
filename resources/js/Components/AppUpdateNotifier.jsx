import { useEffect, useRef, useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

const STORAGE_KEY = 'earth_app_build_id';
const POLL_MS = 5 * 60 * 1000;

const AUTH_PATH_PREFIXES = ['/admin/login', '/login', '/register', '/forgot-password', '/reset-password'];

const isAuthPath = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    const path = window.location.pathname.replace(/\/$/, '') || '/';

    return AUTH_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};

export default function AppUpdateNotifier({ initialBuildId = null }) {
    const [appBuildId, setAppBuildId] = useState(initialBuildId);
    const { showInfo } = useToast();
    const { t } = useTranslation();
    const pendingBuildIdRef = useRef(null);
    const notifiedRef = useRef(false);

    const applyReload = useCallback((buildId) => {
        if (buildId) {
            sessionStorage.setItem(STORAGE_KEY, buildId);
        }
        window.location.reload();
    }, []);

    const promptUpdate = useCallback(
        (remoteBuildId) => {
            if (notifiedRef.current || import.meta.env.DEV) {
                return;
            }

            pendingBuildIdRef.current = remoteBuildId;
            notifiedRef.current = true;

            showInfo(t('appUpdate.message'), {
                title: t('appUpdate.title'),
                type: 'info',
                autoDismiss: false,
                action: {
                    label: t('appUpdate.action'),
                    onClick: () => applyReload(remoteBuildId),
                },
            });
        },
        [applyReload, showInfo, t],
    );

    const checkRemoteVersion = useCallback(async () => {
        if (import.meta.env.DEV || isAuthPath()) {
            return;
        }

        try {
            const response = await fetch(`/build-version.json?_=${Date.now()}`, {
                cache: 'no-store',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            const remoteBuildId = data?.buildId;

            if (!remoteBuildId || typeof remoteBuildId !== 'string') {
                return;
            }

            const stored = sessionStorage.getItem(STORAGE_KEY);

            if (stored && stored !== remoteBuildId) {
                promptUpdate(remoteBuildId);
                return;
            }

            if (!stored) {
                sessionStorage.setItem(STORAGE_KEY, remoteBuildId);
            }
        } catch {
            // Ignore network errors during background checks
        }
    }, [promptUpdate]);

    useEffect(() => {
        const removeListener = router.on('success', (event) => {
            const nextBuildId = event.detail.page?.props?.appBuildId;
            if (nextBuildId) {
                setAppBuildId(nextBuildId);
            }
        });

        return () => removeListener();
    }, []);

    useEffect(() => {
        if (import.meta.env.DEV || !appBuildId || isAuthPath()) {
            return undefined;
        }

        const stored = sessionStorage.getItem(STORAGE_KEY);

        if (!stored) {
            sessionStorage.setItem(STORAGE_KEY, appBuildId);
        } else if (stored !== appBuildId) {
            // Sync after deploy without interrupting login / auth pages
            sessionStorage.setItem(STORAGE_KEY, appBuildId);
        }

        checkRemoteVersion();

        const intervalId = window.setInterval(checkRemoteVersion, POLL_MS);
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkRemoteVersion();
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [appBuildId, checkRemoteVersion, promptUpdate]);

    return null;
}
