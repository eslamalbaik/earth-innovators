import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { FaStar, FaCheck, FaUser, FaBook, FaGraduationCap } from 'react-icons/fa';
import BookingModal from '../Booking/BookingModal';
import { useTranslation } from '@/i18n';
import { formatLocationWithStages, getStageLabels } from '@/utils/stageLocalization';

const getInitials = (name) => {
    if (!name) return '?';

    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return name[0].toUpperCase();
};

const getColorFromName = (name) => {
    const colors = [
        '#667eea, #764ba2',
        '#f093fb, #f5576c',
        '#4facfe, #00f2fe',
        '#43e97b, #38f9d7',
        '#fa709a, #fee140',
        '#30cfd0, #330867',
        '#a8edea, #fed6e3',
        '#ff9a9e, #fecfef',
        '#ffecd2, #fcb69f',
        '#ff8a80, #ea4c89',
    ];

    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

const getImageUrl = (teacher) => {
    if (teacher.image) {
        if (teacher.image.startsWith('http://') || teacher.image.startsWith('https://')) {
            return teacher.image;
        }
        if (teacher.image.startsWith('/storage/')) {
            return teacher.image;
        }
        return `/storage/${teacher.image}`;
    }

    if (teacher.user?.image) {
        if (teacher.user.image.startsWith('http://') || teacher.user.image.startsWith('https://')) {
            return teacher.user.image;
        }
        if (teacher.user.image.startsWith('/storage/')) {
            return teacher.user.image;
        }
        return `/storage/${teacher.user.image}`;
    }

    return null;
};

const getSubjectLabel = (teacher, language) => {
    if (language === 'ar') {
        return teacher.subject_ar || teacher.subject || teacher.subject_en || '';
    }

    return teacher.subject_en || teacher.subject || teacher.subject_ar || '';
};

export default function TeacherCard({ teacher }) {
    const { t, language } = useTranslation();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const stageLabels = getStageLabels(t);
    const teacherLocation = formatLocationWithStages(teacher.location, stageLabels);
    const subjectLabel = getSubjectLabel(teacher, language);

    return (
        <>
            <div className="rounded-xl border border-gray-300 bg-white p-3 transition duration-300 hover:shadow-xl">
                <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-2">
                        <div className="mb-4 flex items-center justify-start gap-2">
                            <div className="relative h-16 w-16 flex-shrink-0">
                                {getImageUrl(teacher) && !imageError ? (
                                    <img
                                        src={getImageUrl(teacher)}
                                        alt={teacher.name}
                                        className="h-full w-full rounded-full border-4 border-green-200 object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div
                                        className="flex h-full w-full items-center justify-center rounded-full border-4 border-green-200 text-xl font-bold text-white"
                                        style={{ background: `linear-gradient(135deg, ${getColorFromName(teacher.name)})` }}
                                    >
                                        {getInitials(teacher.name)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-md font-bold text-gray-900">{teacher.name}</h3>
                                    {teacher.isVerified && (
                                        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-blue-500">
                                            <FaCheck className="text-[8px] text-white" />
                                        </div>
                                    )}
                                </div>
                                <p className="mb-2 text-sm text-gray-600">{teacherLocation}</p>
                                {subjectLabel ? (
                                    <div className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                        {subjectLabel}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className="mb-4 flex items-center justify-end">
                            <div className="flex items-center gap-2">
                                <FaStar className="text-sm text-yellow-400" />
                                <span className="text-sm font-medium text-gray-700">
                                    {teacher.rating ? Number(teacher.rating).toFixed(1) : '0.0'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 flex items-center justify-start gap-2">
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-2">
                            <FaGraduationCap className="text-xs text-green-500" />
                            <span className="text-xs text-gray-700">{t('teachers.experience')} {teacher.experience || 0} {t('teachers.years')}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-2">
                            <FaBook className="text-xs text-blue-500" />
                            <span className="text-xs text-gray-700">{teacher.sessionsCount || 0} {t('teachers.session')}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-2">
                            <FaUser className="text-xs text-purple-900" />
                            <span className="text-xs text-gray-700">{teacher.studentsCount || 0} {t('teachers.studentBenefited')}</span>
                        </div>
                    </div>

                    <div className="mt-auto grid grid-cols-3 items-center gap-3">
                        <div className="flex items-center text-sm font-bold text-gray-900">
                            <span>{teacher.price}</span>
                            <img src="/images/aed-currency(black).svg" alt={t('common.currencySymbol')} className="h-5 w-5" />
                            <span> {t('teachers.perHour')}</span>
                        </div>
                        <div className="col-span-2 grid w-full grid-cols-2 gap-3">
                            <Link
                                href={`/teachers/${teacher.id}`}
                                className="flex-1 rounded-lg border border-gray-200 px-2 py-2 text-center text-[14px] font-meduim text-gray-800 transition duration-300 hover:bg-gray-300"
                            >
                                {t('teachers.teacherDetails')}
                            </Link>
                            <button
                                onClick={() => setIsBookingModalOpen(true)}
                                className="flex-1 rounded-lg bg-yellow-400 px-2 py-2 text-[14px] font-meduim text-black transition duration-300 hover:bg-yellow-500"
                            >
                                {t('teachers.bookNow')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <BookingModal
                teacher={teacher}
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
            />
        </>
    );
}
