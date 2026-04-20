import { usePage } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';

export default function StudentLayout({
    auth: authProp = null,
    title,
    activeNav = 'home',
    onBack = null,
    children,
    desktopMainClassName = 'mx-auto w-full max-w-6xl px-4 pb-24 pt-4',
}) {
    const page = usePage();
    const auth = authProp || page.props?.auth || null;
    const user = auth?.user;
    const isAuthed = !!user;

    return (
        <>
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={title}
                    activeNav={activeNav}
                    onBack={onBack}
                >
                    {children}
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={title}
                    onBack={onBack}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className={desktopMainClassName}>
                    {children}
                </main>
                <MobileBottomNav active={activeNav} role={user?.role} isAuthed={isAuthed} user={user} />
                <DesktopFooter auth={auth} />
            </div>
        </>
    );
}
