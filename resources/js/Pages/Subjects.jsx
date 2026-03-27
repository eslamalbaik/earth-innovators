import { Head, router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import SectionTitle from '../Components/SectionTitle';
import { useTranslation } from '@/i18n';

export default function Subjects({ auth, subjects = [] }) {
    const { t } = useTranslation();

    const handleSubjectClick = (subject) => {
        const subjectName = subject.name || subject.name_ar;
        router.get('/teachers', { subject: subjectName });
    };

    return (
        <MainLayout auth={auth}>
            <Head title={t('subjectsPage.pageTitle', { appName: t('common.appName') })} />

            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <SectionTitle
                            text={t('subjectsPage.title')}
                            size="2xl"
                            align="center"
                            className="pb-2"
                        />

                        <p className="text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed mt-6">
                            {t('subjectsPage.description')}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {subjects.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {subjects.map((subject) => (
                                <div
                                    key={subject.id}
                                    className="w-full h-80"
                                    onClick={() => handleSubjectClick(subject)}
                                >
                                    <div className="bg-white rounded-t-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer text-center h-64 overflow-hidden">
                                        <img
                                            src={subject.image || '/images/subjects/default.png'}
                                            alt={subject.name || subject.name_ar}
                                            className="w-full h-full object-cover rounded-t-lg"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center gap-2 px-3 bg-white rounded-b-lg shadow-lg hover:shadow-xl transition duration-300 cursor-pointer py-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{subject.name || subject.name_ar}</h3>
                                        <p className="text-sm text-gray-600">
                                            {t('subjectsPage.teachersCount', { count: subject.teacher_count || 0 })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-500">
                            {t('subjectsPage.empty')}
                        </div>
                    )}
                </div>
            </section>
        </MainLayout>
    );
}
