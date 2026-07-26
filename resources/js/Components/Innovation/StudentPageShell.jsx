import { Head, router, usePage } from '@inertiajs/react';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import { useTranslation } from '@/i18n';

/**
 * غلاف موحد لصفحات الابتكار الخاصة بالطالب —
 * يطابق بنية لوحة الطالب الأصلية (MobileTopBar + MobileBottomNav + RTL)
 */
export default function StudentPageShell({ title, backHref = '/dashboard', children }) {
    const { language } = useTranslation();
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={title} />

            <MobileTopBar
                title={title}
                onNotifications={() => router.visit('/notifications')}
                onBack={() => router.visit(backHref)}
                reverseOrder={false}
            />

            <main className="mx-auto w-full max-w-5xl px-3 pb-24 pt-5 sm:px-4 lg:px-6">
                {children}
            </main>

            <MobileBottomNav active="home" role={user?.role} isAuthed={!!user} user={user} />
        </div>
    );
}
