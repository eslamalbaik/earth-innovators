import MobileFrame from '@/Components/Mobile/MobileFrame';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useFlashNotifications } from '@/Hooks/useFlashNotifications';

export default function MobileAppLayout({
    auth,
    title,
    activeNav = 'home',
    unreadCount = 0,
    onNotifications,
    onBack,
    children,
}) {
    useFlashNotifications();
    const user = auth?.user;
    const isAuthed = !!user;

    return (
        <MobileFrame>
            <MobileTopBar
                title={title}
                unreadCount={unreadCount}
                onNotifications={onNotifications}
                onBack={onBack}
                auth={auth}
            />
            <main className="px-4 pb-24 pt-4">{children}</main>
            <MobileBottomNav active={activeNav} role={user?.role} isAuthed={isAuthed} user={user} />
        </MobileFrame>
    );
}

