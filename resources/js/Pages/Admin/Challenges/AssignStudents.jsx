import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaSave, FaTimes, FaUser, FaCheckCircle, FaStar, FaExclamationCircle } from 'react-icons/fa';

export default function AdminChallengesAssignStudents({ challenge, students, assignedStudents }) {
    const { t, language } = useTranslation();
    const BackIcon = language === 'ar' ? FaArrowRight : FaArrowLeft;

    const [selectedStudents, setSelectedStudents] = useState(() => {
        const assigned = {};
        assignedStudents.forEach((student) => {
            assigned[student.id] = student.participation_type;
        });
        return assigned;
    });

    const { data, setData, post, processing, errors } = useForm({
        students: [],
    });

    const handleStudentToggle = (studentId) => {
        setSelectedStudents((prev) => {
            const next = { ...prev };

            if (next[studentId]) {
                delete next[studentId];
            } else {
                next[studentId] = 'optional';
            }

            return next;
        });
    };

    const handleParticipationTypeChange = (studentId, type) => {
        setSelectedStudents((prev) => ({
            ...prev,
            [studentId]: type,
        }));
    };

    const submit = (event) => {
        event.preventDefault();

        const studentsArray = Object.entries(selectedStudents).map(([user_id, participation_type]) => ({
            user_id: parseInt(user_id, 10),
            participation_type,
        }));

        setData('students', studentsArray);

        post(route('admin.challenges.assign-students.store', challenge.id), {
            preserveScroll: true,
        });
    };

    const getParticipationTypeLabel = (type) => {
        const labels = {
            mandatory: t('adminChallengeAssignStudentsPage.participationTypes.mandatory'),
            optional: t('adminChallengeAssignStudentsPage.participationTypes.optional'),
            favorite: t('adminChallengeAssignStudentsPage.participationTypes.favorite'),
        };

        return labels[type] || labels.optional;
    };

    const getParticipationTypeIcon = (type) => {
        switch (type) {
            case 'mandatory':
                return <FaExclamationCircle className="text-red-500" />;
            case 'favorite':
                return <FaStar className="text-yellow-500" />;
            default:
                return <FaCheckCircle className="text-green-500" />;
        }
    };

    const getParticipationTypeColor = (type) => {
        switch (type) {
            case 'mandatory':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'favorite':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-green-100 text-green-800 border-green-300';
        }
    };

    return (
        <DashboardLayout header={t('adminChallengeAssignStudentsPage.title')}>
            <Head title={t('adminChallengeAssignStudentsPage.pageTitle', { title: challenge.title })} />

            <div className="mb-6">
                <Link
                    href={route('admin.challenges.show', challenge.id)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    <BackIcon />
                    {t('adminChallengeAssignStudentsPage.backToChallenge')}
                </Link>
            </div>

            <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-2 text-xl font-bold text-gray-900">{challenge.title}</h2>
                <p className="text-gray-600">{t('adminChallengeAssignStudentsPage.schoolLabel', { school: challenge.school_name })}</p>
            </div>

            <form onSubmit={submit} className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">{t('adminChallengeAssignStudentsPage.selectStudentsTitle')}</h3>
                    <p className="mb-4 text-sm text-gray-600">{t('adminChallengeAssignStudentsPage.selectStudentsDescription')}</p>
                </div>

                {students.length === 0 ? (
                    <div className="py-12 text-center">
                        <FaUser className="mx-auto mb-4 text-6xl text-gray-300" />
                        <p className="text-gray-600">{t('adminChallengeAssignStudentsPage.noStudents')}</p>
                    </div>
                ) : (
                    <div className="max-h-96 space-y-3 overflow-y-auto">
                        {students.map((student) => {
                            const isSelected = selectedStudents[student.id] !== undefined;
                            const participationType = selectedStudents[student.id] || 'optional';

                            return (
                                <div
                                    key={student.id}
                                    className={`rounded-lg border-2 p-4 transition ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-1 items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleStudentToggle(student.id)}
                                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-gray-400" />
                                                    <span className="font-semibold text-gray-900">{student.name}</span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">{student.email}</p>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={participationType}
                                                    onChange={(event) => handleParticipationTypeChange(student.id, event.target.value)}
                                                    onClick={(event) => event.stopPropagation()}
                                                    className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold focus:border-transparent focus:ring-2 focus:ring-blue-500 ${getParticipationTypeColor(participationType)}`}
                                                >
                                                    <option value="mandatory">{t('adminChallengeAssignStudentsPage.participationTypes.mandatory')}</option>
                                                    <option value="optional">{t('adminChallengeAssignStudentsPage.participationTypes.optional')}</option>
                                                    <option value="favorite">{t('adminChallengeAssignStudentsPage.participationTypes.favorite')}</option>
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    {getParticipationTypeIcon(participationType)}
                                                    <span className="text-sm font-semibold">{getParticipationTypeLabel(participationType)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {errors.students && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-600">{errors.students}</p>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between border-t pt-6">
                    <div className="text-sm text-gray-600">
                        {t('adminChallengeAssignStudentsPage.selectedStudentsCount', {
                            count: Object.keys(selectedStudents).length,
                        })}
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href={route('admin.challenges.show', challenge.id)}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            <FaTimes />
                            {t('common.cancel')}
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || Object.keys(selectedStudents).length === 0}
                            className="flex items-center gap-2 rounded-lg bg-[#A3C042] px-6 py-2 text-white hover:bg-[#8CA635] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FaSave />
                            {processing ? t('adminChallengeAssignStudentsPage.saving') : t('common.save')}
                        </button>
                    </div>
                </div>
            </form>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <h4 className="mb-3 font-semibold text-gray-900">{t('adminChallengeAssignStudentsPage.legendTitle')}</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                        <FaExclamationCircle className="text-red-500" />
                        <span className="text-sm">
                            <strong>{t('adminChallengeAssignStudentsPage.participationTypes.mandatory')}:</strong>{' '}
                            {t('adminChallengeAssignStudentsPage.legend.mandatory')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        <span className="text-sm">
                            <strong>{t('adminChallengeAssignStudentsPage.participationTypes.optional')}:</strong>{' '}
                            {t('adminChallengeAssignStudentsPage.legend.optional')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        <span className="text-sm">
                            <strong>{t('adminChallengeAssignStudentsPage.participationTypes.favorite')}:</strong>{' '}
                            {t('adminChallengeAssignStudentsPage.legend.favorite')}
                        </span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
