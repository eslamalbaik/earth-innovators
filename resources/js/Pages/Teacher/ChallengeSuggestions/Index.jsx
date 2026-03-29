import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import ChallengeSuggestionsManagement from '@/Components/ChallengeSuggestions/ChallengeSuggestionsManagement';

export default function TeacherChallengeSuggestionsIndex({ suggestions, stats, filters, hasSchool }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout>
            <Head title={t('challengeSuggestionsPage.teacherPageTitle', { appName: t('common.appName') })} />

            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('challengeSuggestionsPage.teacherTitle')}</h1>
                    <p className="text-sm text-gray-600">{t('challengeSuggestionsPage.teacherSubtitle')}</p>
                </div>

                <ChallengeSuggestionsManagement
                    suggestions={suggestions}
                    stats={stats}
                    filters={filters}
                    listRoute="/teacher/challenge-suggestions"
                    updateStatusPrefix="/teacher/challenge-suggestions"
                    showNoSchoolWarning={!hasSchool}
                />
            </div>
        </DashboardLayout>
    );
}
