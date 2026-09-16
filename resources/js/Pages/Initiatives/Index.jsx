import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FaSchool, FaGlobe, FaCalendar, FaGift } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

function InitiativeCard({ initiative }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900">{initiative.title_ar}</h3>
            {initiative.description_ar && <p className="text-sm text-gray-600 mt-1">{initiative.description_ar}</p>}
            {initiative.benefit_details && (
                <div className="flex items-start gap-1.5 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5 mt-2">
                    <FaGift className="mt-0.5 shrink-0" /> {initiative.benefit_details}
                </div>
            )}
            {(initiative.start_date || initiative.end_date) && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    <FaCalendar /> {initiative.start_date || '—'} → {initiative.end_date || '—'}
                </div>
            )}
        </div>
    );
}

export default function InitiativesIndex({ auth, schoolInitiatives = [], globalInitiatives = [] }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout auth={auth}>
            <Head title={t('initiativesPage.title')} />
            <div className="p-6 max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">{t('initiativesPage.title')}</h1>
                    <p className="text-sm text-gray-600 mt-1">{t('initiativesPage.subtitle')}</p>
                </div>

                <div>
                    <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                        <FaSchool className="text-indigo-500" /> {t('initiativesPage.mySchool')}
                    </h2>
                    {schoolInitiatives.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {schoolInitiatives.map((i) => <InitiativeCard key={i.id} initiative={i} />)}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 py-4">{t('initiativesPage.noSchoolInitiatives')}</p>
                    )}
                </div>

                <div>
                    <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                        <FaGlobe className="text-blue-500" /> {t('initiativesPage.global')}
                    </h2>
                    {globalInitiatives.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {globalInitiatives.map((i) => <InitiativeCard key={i.id} initiative={i} />)}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 py-4">{t('initiativesPage.noGlobalInitiatives')}</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
