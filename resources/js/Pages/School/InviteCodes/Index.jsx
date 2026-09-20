import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InviteCodesPanel from '@/Components/InviteCodes/InviteCodesPanel';
import { useTranslation } from '@/i18n';

export default function SchoolInviteCodesIndex({ auth, codes }) {
    const { t } = useTranslation();
    return (
        <DashboardLayout auth={auth}>
            <Head title={t('schoolInviteCodesPage.pageTitle', { appName: t('common.appName') })} />
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-black text-gray-900 mb-1">{t('schoolInviteCodesPage.title')}</h1>
                <p className="text-sm text-gray-600 mb-6">
                    {t('schoolInviteCodesPage.subtitle')}
                </p>
                <InviteCodesPanel codes={codes} storeRoute="school.invite-codes.store" destroyRoute="school.invite-codes.destroy" allowedRoles={['student', 'teacher']} />
            </div>
        </DashboardLayout>
    );
}
