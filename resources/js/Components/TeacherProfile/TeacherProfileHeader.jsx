import { FaStar, FaCheck, FaUser, FaBook, FaGraduationCap } from 'react-icons/fa';
import { getInitials, getColorFromName } from '../../utils/imageUtils';

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

const formatLocation = (location) => {
    if (!location) return '';

    const generalStages = ['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'];

    if (location.includes(' - ')) {
        const [city, stagesPart] = location.split(' - ');
        if (!stagesPart) return city;

        const stages = stagesPart.split(' / ').map(s => s.trim());
        const generalStagesOnly = stages.filter(stage => {
            if (!stage || typeof stage !== 'string') return false;
            const trimmed = stage.trim();
            return trimmed.length > 0 && trimmed.length < 50 && generalStages.includes(trimmed);
        });

        if (generalStagesOnly.length > 0) {
            return `${city} - ${generalStagesOnly.join(' / ')}`;
        }
        return city;
    }

    return location;
};

const formatSubject = (subject) => {
    if (!subject) return '';

    const isValidSubjectString = (str) => {
        if (!str || typeof str !== 'string') return false;
        const trimmed = str.trim();
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
            } catch (e) {
                return '';
            }
        } else {
            if (isValidSubjectString(subject)) {
                return trimmed;
            }
        }
    }

    if (Array.isArray(subject)) {
        const validSubjects = subject.filter(isValidSubjectString);
        return validSubjects.length > 0 ? validSubjects[0].trim() : '';
    }

    return '';
};

export default function TeacherProfileHeader({ teacher, onBookClick }) {
    return (
        <div className="flex flex-col items-start gap-8">
            <div className="w-full flex items-center justify-between gap-4">
                <div className="flex items-center justifiy-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 relative">
                            {teacher?.image ? (
                                <img
                                    src={getImageUrl(teacher.image)}
                                    alt={teacher?.name || ''}
                                    className="w-full h-full object-cover rounded-full border-4 border-green-200"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextElementSibling) {
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }
                                    }}
                                />
                            ) : null}
                            <div
                                className={`w-full h-full rounded-full border-4 border-green-200 flex items-center justify-center text-white font-bold text-lg ${teacher?.image ? 'hidden' : ''}`}
                                style={{
                                    background: (() => {
                                        const colors = getColorFromName(teacher?.name || '');
                                        const colorParts = colors.split(', ');
                                        return `linear-gradient(135deg, ${colorParts[0] || '#fbbf24'}, ${colorParts[1] || '#f59e0b'})`;
                                    })()
                                }}
                            >
                                {getInitials(teacher?.name || '')}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-lg font-bold text-gray-900">{teacher?.name || ''}</h1>
                            {teacher?.isVerified && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                    <FaCheck className="text-white text-[8px]" />
                                </div>
                            )}
                        </div>

                        <p className="text-gray-600 mb-2 text-[14px]">{formatLocation(teacher?.location || '')}</p>

                        {(() => {
                            if (!teacher) return null;
                            const displaySubject = formatSubject(
                                teacher.subject ||
                                (Array.isArray(teacher.subjects) && teacher.subjects.length > 0 ? teacher.subjects[0] : '') ||
                                (typeof teacher.subjects === 'string' ? teacher.subjects : '')
                            );
                            return displaySubject ? (
                                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium inline-block">
                                    {displaySubject}
                                </div>
                            ) : null;
                        })()}
                    </div>
                </div>
                <div>
                    <div className="bg-white">
                        <div className="flex justify-start items-center gap-4">
                            <div className="text-sm font-bold text-gray-900 flex items-center ">
                                <span>{teacher?.price || '0'}</span>
                                <img src="/images/sar-currency(black).svg" alt="currency" className="w-5 h-5" />
                                <span> / ساعة</span>
                            </div>

                            <button
                                onClick={onBookClick}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-md transition duration-300 transform hover:scale-105"
                            >
                                احجز الآن
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <p className="text-gray-700 leading-relaxed mb-4">
                    {teacher?.bio || ''}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg py-1 px-2">
                        <div className="flex items-center gap-1">
                            <FaStar className="text-sm text-yellow-400" />
                        </div>
                        <span className="text-gray-700 font-medium">
                            {teacher?.rating ? Number(teacher.rating).toFixed(1) : '0.0'} ({teacher?.reviewsCount || 0} تقييم)
                        </span>
                    </div>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg py-1 px-2">
                        <FaGraduationCap className="text-green-500 text-sm" />
                        <span className="text-gray-700">خبرة {teacher?.experience || 0} سنوات</span>
                    </div>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg py-1 px-2">
                        <FaBook className="text-blue-500 text-sm" />
                        <span className="text-gray-700">{teacher?.sessionsCount || 0} حصة</span>
                    </div>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg py-1 px-2">
                        <FaUser className="text-purple-900 text-sm" />
                        <span className="text-gray-700">{teacher?.studentsCount || 0} طالب استفاد منه</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
