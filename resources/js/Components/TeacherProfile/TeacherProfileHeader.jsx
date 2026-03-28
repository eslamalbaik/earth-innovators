import { FaStar, FaCheck, FaUser, FaBook, FaGraduationCap } from 'react-icons/fa';
import { getInitials, getColorFromName } from '../../utils/imageUtils';
import { useTranslation } from '@/i18n';
import { formatLocationWithStages, getStageLabels } from '@/utils/stageLocalization';

const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
    }
    if (image.startsWith('/storage/')) {
        return image;
    }
    return `/storage/${image}`;
};

const formatSubject = (subject) => {
    if (!subject) return '';

    const isValidSubjectString = (value) => {
        if (!value || typeof value !== 'string') return false;
        const trimmed = value.trim();
        if (trimmed.length === 0 || trimmed.length > 100) return false;
        if (trimmed.length < 2) return false;
        if (/^[\[\]\\",\s\u0000-\u001F]+$/.test(trimmed)) return false;
        if (trimmed.includes('\\u') || trimmed.includes('\\"')) return false;
        return /^[\u0600-\u06FF\s\w\-]+$/.test(trimmed);
    };

    if (typeof subject === 'string') {
        const trimmed = subject.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('"')) {
            try {
                const parsed = JSON.parse(subject);
                if (Array.isArray(parsed)) {
                    const validSubjects = parsed.filter(isValidSubjectString);
                    return validSubjects.length > 0 ? validSubjects[0].trim() : '';
                }
            } catch (error) {
                return '';
            }
        } else if (isValidSubjectString(subject)) {
            return trimmed;
        }
    }

    if (Array.isArray(subject)) {
        const validSubjects = subject.filter(isValidSubjectString);
        return validSubjects.length > 0 ? validSubjects[0].trim() : '';
    }

    return '';
};

export default function TeacherProfileHeader({ teacher, onBookClick }) {
    const { t } = useTranslation();
    const stageLabels = getStageLabels(t);
    const teacherLocation = formatLocationWithStages(teacher?.location || '', stageLabels);

    return (
        <div className="flex flex-col items-start gap-8">
            <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center justifiy-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="relative h-16 w-16">
                            {teacher?.image ? (
                                <img
                                    src={getImageUrl(teacher.image)}
                                    alt={teacher?.name || ''}
                                    className="h-full w-full rounded-full border-4 border-green-200 object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextElementSibling) {
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }
                                    }}
                                />
                            ) : null}
                            <div
                                className={`flex h-full w-full items-center justify-center rounded-full border-4 border-green-200 text-lg font-bold text-white ${teacher?.image ? 'hidden' : ''}`}
                                style={{
                                    background: (() => {
                                        const colors = getColorFromName(teacher?.name || '');
                                        const colorParts = colors.split(', ');
                                        return `linear-gradient(135deg, ${colorParts[0] || '#fbbf24'}, ${colorParts[1] || '#f59e0b'})`;
                                    })(),
                                }}
                            >
                                {getInitials(teacher?.name || '')}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="mb-1 flex items-center gap-3">
                            <h1 className="text-lg font-bold text-gray-900">{teacher?.name || ''}</h1>
                            {teacher?.isVerified && (
                                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-blue-500">
                                    <FaCheck className="text-[8px] text-white" />
                                </div>
                            )}
                        </div>

                        <p className="mb-2 text-[14px] text-gray-600">{teacherLocation}</p>

                        {(() => {
                            if (!teacher) return null;
                            const displaySubject = formatSubject(
                                teacher.subject
                                || (Array.isArray(teacher.subjects) && teacher.subjects.length > 0 ? teacher.subjects[0] : '')
                                || (typeof teacher.subjects === 'string' ? teacher.subjects : ''),
                            );

                            return displaySubject ? (
                                <div className="inline-block rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800">
                                    {displaySubject}
                                </div>
                            ) : null;
                        })()}
                    </div>
                </div>
                <div>
                    <div className="bg-white">
                        <div className="flex items-center justify-start gap-4">
                            <div className="flex items-center text-sm font-bold text-gray-900">
                                <span>{teacher?.price || '0'}</span>
                                <img src="/images/aed-currency(black).svg" alt={t('common.currencySymbol')} className="h-5 w-5" />
                                <span> {t('teachers.perHour')}</span>
                            </div>

                            <button
                                onClick={onBookClick}
                                className="rounded-lg bg-yellow-400 px-4 py-2 text-md font-bold text-black transition duration-300 hover:scale-105 hover:bg-yellow-500"
                            >
                                {t('teachers.bookNow')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <p className="mb-4 leading-relaxed text-gray-700">
                    {teacher?.bio || ''}
                </p>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1">
                        <div className="flex items-center gap-1">
                            <FaStar className="text-sm text-yellow-400" />
                        </div>
                        <span className="font-medium text-gray-700">
                            {teacher?.rating ? Number(teacher.rating).toFixed(1) : '0.0'} ({teacher?.reviewsCount || 0} {t('teachers.reviews')})
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1">
                        <FaGraduationCap className="text-sm text-green-500" />
                        <span className="text-gray-700">{t('teachers.experience')} {teacher?.experience || 0} {t('teachers.years')}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1">
                        <FaBook className="text-sm text-blue-500" />
                        <span className="text-gray-700">{teacher?.sessionsCount || 0} {t('teachers.session')}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1">
                        <FaUser className="text-sm text-purple-900" />
                        <span className="text-gray-700">{teacher?.studentsCount || 0} {t('teachers.studentBenefited')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
