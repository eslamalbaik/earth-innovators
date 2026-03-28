import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { FaBook, FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { getStageLabels } from '@/utils/stageLocalization';

export default function Subjects({ teacher, teacherSubjects, availableSubjects, stages }) {
    const { t, language } = useTranslation();
    const stageLabels = getStageLabels(t);
    const [isAdding, setIsAdding] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    const getStages = () => {
        if (!teacher?.stages) return [];

        const filterValidStages = (stagesArray) => {
            if (!Array.isArray(stagesArray)) return [];

            const generalStages = ['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'];
            const validStages = stagesArray
                .filter((stage) => {
                    if (!stage) return false;
                    const stageStr = String(stage).trim();
                    if (stageStr.length === 0) return false;
                    if (stageStr.length > 50) return false;
                    return generalStages.includes(stageStr) || stageStr.match(/^[\u0600-\u06FF\s]+$/);
                })
                .map((stage) => String(stage).trim());

            return [...new Set(validStages)];
        };

        if (Array.isArray(teacher.stages)) {
            return filterValidStages(teacher.stages);
        }

        if (typeof teacher.stages === 'string') {
            try {
                const parsed = JSON.parse(teacher.stages);
                if (Array.isArray(parsed)) {
                    return filterValidStages(parsed);
                }
            } catch (e) {
                return [];
            }
        }

        return [];
    };

    const formatStageLabel = (stage) => {
        const stageKey = stageLabels?.toKey?.[stage] || stageLabels?.toKey?.[stage?.toLowerCase?.()];

        if (stageKey) {
            return stageLabels.toLabel[stageKey] || stage;
        }

        return stage;
    };

    const formatStages = (stagesArray) => {
        if (!stagesArray || stagesArray.length === 0) return t('common.notAvailable');

        return stagesArray.map(formatStageLabel).join(', ');
    };

    const getSubjectName = (subject) => (
        language === 'en'
            ? (subject?.name_en || subject?.name_ar || t('common.notAvailable'))
            : (subject?.name_ar || subject?.name_en || t('common.notAvailable'))
    );

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        subject_id: '',
        stages: [],
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        post('/teacher/subjects', {
            onSuccess: () => {
                setIsAdding(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(`/teacher/subjects/${editingSubject.id}`, {
            onSuccess: () => {
                setEditingSubject(null);
                reset();
            },
        });
    };

    const handleDelete = (subject) => {
        setSubjectToDelete(subject);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (subjectToDelete) {
            destroy(`/teacher/subjects/${subjectToDelete.id}`, {
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setSubjectToDelete(null);
                },
            });
        }
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setData({
            subject_id: subject.id,
            stages: teacher?.stages || [],
        });
    };

    const handleStageChange = (stage) => {
        const currentStages = data.stages;
        if (currentStages.includes(stage)) {
            setData('stages', currentStages.filter((item) => item !== stage));
        } else {
            setData('stages', [...currentStages, stage]);
        }
    };

    return (
        <DashboardLayout header={t('teacherSubjectsPage.title')}>
            <Head title={t('teacherSubjectsPage.pageTitle', { appName: t('common.appName') })} />

            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{t('teacherSubjectsPage.title')}</h1>
                            <p className="text-gray-600 mt-1">{t('teacherSubjectsPage.subtitle')}</p>
                        </div>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition"
                        >
                            <FaPlus />
                            {t('teacherSubjectsPage.actions.add')}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                        <h2 className="text-lg font-bold text-gray-900">{t('teacherSubjectsPage.addedSubjectsTitle')}</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {teacherSubjects && teacherSubjects.length > 0 ? (
                            teacherSubjects.map((subject) => (
                                <div key={subject.id} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{getSubjectName(subject)}</h3>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-600">
                                                    {t('teacherSubjectsPage.stagesLabel')}: {formatStages(getStages())}
                                                </span>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                    {t('common.active')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(subject)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title={t('common.edit')}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title={t('common.delete')}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <FaBook className="mx-auto text-4xl mb-4 text-gray-300" />
                                <p>{t('teacherSubjectsPage.empty.title')}</p>
                                <p className="text-sm">{t('teacherSubjectsPage.empty.description')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {isAdding && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">{t('teacherSubjectsPage.modals.addTitle')}</h2>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="text-2xl" />
                                </button>
                            </div>
                            <form onSubmit={handleAddSubmit} className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('teacherSubjectsPage.form.subjectLabel')}
                                    </label>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        required
                                    >
                                        <option value="">{t('teacherSubjectsPage.form.subjectPlaceholder')}</option>
                                        {availableSubjects?.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {getSubjectName(subject)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject_id && <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('teacherSubjectsPage.form.stagesLabel')}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {stages?.map((stage) => (
                                            <label key={stage} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.stages.includes(stage)}
                                                    onChange={() => handleStageChange(stage)}
                                                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                                />
                                                <span className="text-sm text-gray-700">{formatStageLabel(stage)}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.stages && <p className="text-red-500 text-sm mt-2">{errors.stages}</p>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition duration-300"
                                    >
                                        {processing ? t('teacherSubjectsPage.actions.adding') : t('teacherSubjectsPage.actions.add')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition duration-300"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {editingSubject && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">{t('teacherSubjectsPage.modals.editTitle')}</h2>
                                <button
                                    onClick={() => setEditingSubject(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="text-2xl" />
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('teacherSubjectsPage.form.subjectLabel')}
                                    </label>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        required
                                    >
                                        <option value="">{t('teacherSubjectsPage.form.subjectPlaceholder')}</option>
                                        {availableSubjects?.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {getSubjectName(subject)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject_id && <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('teacherSubjectsPage.form.stagesLabel')}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {stages?.map((stage) => (
                                            <label key={stage} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.stages.includes(stage)}
                                                    onChange={() => handleStageChange(stage)}
                                                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                                />
                                                <span className="text-sm text-gray-700">{formatStageLabel(stage)}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.stages && <p className="text-red-500 text-sm mt-2">{errors.stages}</p>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition duration-300"
                                    >
                                        {processing ? t('teacherSubjectsPage.actions.updating') : t('teacherSubjectsPage.actions.update')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingSubject(null)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition duration-300"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {showDeleteConfirm && subjectToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <FaTrash className="text-2xl text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{t('teacherSubjectsPage.deleteConfirm.title')}</h2>
                            <p className="text-gray-600 text-center mb-6">
                                {t('teacherSubjectsPage.deleteConfirm.message', { name: getSubjectName(subjectToDelete) })}
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
                                >
                                    {t('common.delete')}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setSubjectToDelete(null);
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
