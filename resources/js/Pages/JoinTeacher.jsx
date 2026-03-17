import { Head } from '@inertiajs/react';
import { FaChevronLeft } from 'react-icons/fa';
import MainLayout from '../Layouts/MainLayout';
import JoinTeacherForm from '../Components/JoinTeacher/JoinTeacherForm';
import { useTranslation } from '@/i18n';

export default function JoinTeacher({ auth, subjects = [], cities = [] }) {
    const { t } = useTranslation();

    return (
        <MainLayout auth={auth}>
            <Head title={t('joinTeacherPage.pageTitle', { appName: t('common.appName') })} />

            <section className="py-4 bg-gray-50">
                <div className="max-w-4xl mx-auto text-sm text-gray-600 flex justify-start items-center gap-0.5">
                    <span>{t('joinTeacherPage.breadcrumbHome')}</span>
                    <span className="mx-1"><FaChevronLeft className="text-xs" /></span>
                    <span className="text-gray-900 font-medium">{t('joinTeacherPage.breadcrumbTitle')}</span>
                </div>
            </section>

            <section className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {t('joinTeacherPage.title')}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {t('joinTeacherPage.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-8 bg-yellow-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <JoinTeacherForm subjects={subjects} cities={cities} />
                </div>
            </section>
        </MainLayout>
    );
}
