import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import ChallengeSuggestionsManagement from '@/Components/ChallengeSuggestions/ChallengeSuggestionsManagement';

export default function AdminChallengeSuggestionsIndex({ suggestions, stats, filters }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout>
            <Head title={t('challengeSuggestionsPage.adminPageTitle', { appName: t('common.appName') })} />

            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('challengeSuggestionsPage.adminTitle')}</h1>
                    <p className="text-sm text-gray-600">{t('challengeSuggestionsPage.adminSubtitle')}</p>
                </div>

                <ChallengeSuggestionsManagement
                    suggestions={suggestions}
                    stats={stats}
                    filters={filters}
                    listRoute="/admin/challenge-suggestions"
                    updateStatusPrefix="/admin/challenge-suggestions"
                    showSchool
                />
            </div>
        </DashboardLayout>
    );
}
