import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { FaStar, FaCheck, FaUser, FaBook, FaGraduationCap } from 'react-icons/fa';
import BookingModal from '../Booking/BookingModal';

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

const formatLocation = (location) => {
    if (!location) return '';

    const generalStages = ['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'];

    if (location.includes(' - ')) {
        const [city, stagesPart] = location.split(' - ');
        if (!stagesPart) return city;

        const stages = stagesPart.split(' / ').map(s => s.trim());
        const generalStagesOnly = stages.filter(stage => generalStages.includes(stage));

        if (generalStagesOnly.length > 0) {
            return `${city} - ${generalStagesOnly.join(' / ')}`;
        }
        return city;
    }

    return location;
};

export default function TeacherCard({ teacher }) {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-300 p-3 hover:shadow-xl transition duration-300">
                <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2">
                        <div className="mb-4 flex items-center justify-start gap-2">
                            <div className="w-16 h-16 relative flex-shrink-0">
                                {getImageUrl(teacher) && !imageError ? (
                                    <img
                                        src={getImageUrl(teacher)}
                                        alt={teacher.name}
                                        className="w-full h-full object-cover rounded-full border-4 border-green-200"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full rounded-full border-4 border-green-200 flex items-center justify-center text-white font-bold text-xl"
                                        style={{
                                            background: `linear-gradient(135deg, ${getColorFromName(teacher.name)})`
                                        }}
                                    >
                                        {getInitials(teacher.name)}
                                    </div>
                                )}
                            </div>
                            <div className="">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-md font-bold text-gray-900">{teacher.name}</h3>
                                    {teacher.isVerified && (
                                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                            <FaCheck className="text-white text-[8px]" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{formatLocation(teacher.location)}</p>
                                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium inline-block">
                                    {teacher.subject}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end mb-4">
                            <div className="flex items-center gap-2">
                                <FaStar className="text-yellow-400 text-sm" />
                                <span className="text-sm font-medium text-gray-700">
                                    {teacher.rating ? Number(teacher.rating).toFixed(1) : '0.0'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 flex items-center justify-start gap-2">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2">
                            <FaGraduationCap className="text-green-500 text-xs" />
                            <span className="text-xs text-gray-700">خبرة {teacher.experience || 0} سنوات</span>
                        </div>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2">
                            <FaBook className="text-blue-500 text-xs" />
                            <span className="text-xs text-gray-700">{teacher.sessionsCount || 0} حصة</span>
                        </div>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2">
                            <FaUser className="text-purple-900 text-xs" />
                            <span className="text-xs text-gray-700">{teacher.studentsCount || 0} طالب استفاد منه</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-3 mt-auto">
                        <div className="text-sm font-bold text-gray-900 flex items-center ">
                            <span>{teacher.price}</span>
                            <img src="/images/sar-currency(black).svg" alt="currency" className="w-5 h-5" />
                            <span> / ساعة</span>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 w-full gap-3">
                            <Link
                                href={`/teachers/${teacher.id}`}
                                className="font-meduim flex-1 border border-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-2 rounded-lg text-[14px] transition duration-300 text-center"
                            >
                                تفاصيل المعلم
                            </Link>
                            <button
                                onClick={() => setIsBookingModalOpen(true)}
                                className="font-meduim flex-1 bg-yellow-400 hover:bg-yellow-500 text-black px-2 py-2 rounded-lg text-[14px] transition duration-300"
                            >
                                احجز الآن
                            </button>
                        </div>
                    </div>
                </div>
            </div >

            <BookingModal
                teacher={teacher}
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
            />
        </>
    );
}
