import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InviteCodesPanel from '@/Components/InviteCodes/InviteCodesPanel';
import { useTranslation } from '@/i18n';

export default function TeacherInviteCodesIndex({ auth, codes }) {
    const { t } = useTranslation();
    return (
        <DashboardLayout auth={auth}>
            <Head title={t('teacherInviteCodesPage.pageTitle', { appName: t('common.appName') })} />
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-black text-gray-900 mb-1">{t('teacherInviteCodesPage.title')}</h1>
                <p className="text-sm text-gray-600 mb-6">
                    {t('teacherInviteCodesPage.subtitle')}
                </p>
                <InviteCodesPanel codes={codes} storeRoute="teacher.invite-codes.store" destroyRoute="teacher.invite-codes.destroy" allowedRoles={['student']} />
            </div>
        </DashboardLayout>
    );
}
