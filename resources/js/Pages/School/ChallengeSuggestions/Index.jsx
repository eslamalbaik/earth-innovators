import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import ChallengeSuggestionsManagement from '@/Components/ChallengeSuggestions/ChallengeSuggestionsManagement';

export default function SchoolChallengeSuggestionsIndex({ suggestions, stats, filters }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout>
            <Head title={t('challengeSuggestionsPage.schoolPageTitle', { appName: t('common.appName') })} />

            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('challengeSuggestionsPage.schoolTitle')}</h1>
                    <p className="text-sm text-gray-600">{t('challengeSuggestionsPage.schoolSubtitle')}</p>
                </div>

                <ChallengeSuggestionsManagement
                    suggestions={suggestions}
                    stats={stats}
                    filters={filters}
                    listRoute="/school/challenge-suggestions"
                    updateStatusPrefix="/school/challenge-suggestions"
                />
            </div>
        </DashboardLayout>
    );
}
