import SectionTitle from '../SectionTitle';
import { FaStar, FaCheck, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { getInitials, getColorFromName } from '../../utils/imageUtils';
import { useState } from 'react';

const TeacherImage = ({ teacher }) => {
    const [imageError, setImageError] = useState(false);
    const hasImage = teacher.image && !imageError;

    return (
        <div className="w-20 h-20 mx-auto mb-4 relative">
            {hasImage ? (
                <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-full h-full object-cover rounded-full border-4 border-gray-200"
                    onError={() => setImageError(true)}
                />
            ) : null}
            <div
                className={`w-full h-full rounded-full border-4 border-gray-200 flex items-center justify-center text-white font-bold text-xl ${hasImage ? 'hidden' : ''}`}
                style={{
                    background: `linear-gradient(135deg, ${getColorFromName(teacher.name || 'Teacher')})`
                }}
            >
                {getInitials(teacher.name || 'Teacher')}
            </div>
        </div>
    );
};

export default function TeachersSection({
    title = "أبرز المشاريع الإبداعية",
    subtitle = "استكشف مشاريع الطلاب المبتكرين في مختلف المجالات والفئات العمرية.",
    teachers = [],
    onViewAllTeachers,
    onTeacherClick,
    onPreviousClick,
    onNextClick
}) {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <SectionTitle
                        text={title}
                        size="2xl"
                        align="center"
                        className="pb-2"
                    />

                    <p className="mb-8 text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                </div>

                <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-6 pb-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-4 lg:gap-6">
                            {teachers.length === 0 ? (
                                <div className="col-span-4 text-center py-12">
                                    <p className="text-gray-600">لا يوجد معلمين متاحين حالياً</p>
                                </div>
                            ) : (
                                teachers.map((teacher) => (
                                    <div
                                        key={teacher.id}
                                        className="flex flex-col items-between justify-between bg-white rounded-lg p-6 border border-gray-100 min-w-[280px] lg:min-w-0 cursor-pointer"
                                        onClick={() => onTeacherClick && onTeacherClick(teacher)}
                                    >
                                        <div>
                                            <TeacherImage teacher={teacher} />

                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
                                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <FaCheck className="text-white text-[8px]" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <FaStar className="text-yellow-500 text-sm" />
                                                    <span className="text-sm font-medium text-gray-700">{teacher.rating}</span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3">{teacher.location}</p>

                                            <div className="bg-legacy-green/20 text-legacy-green px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block border border-legacy-green/30">
                                                {teacher.subject}
                                            </div>
                                        </div>

                                        <div className="text-end text-lg font-bold text-gray-900">
                                            <div className="text-sm font-bold text-gray-900 flex items-center ">
                                                <p className="text-md font-bold text-gray-900 mt-1">{teacher.price}</p>
                                                <img src="/images/sar-currency(black).svg" alt="currency" className="w-5 h-5" />
                                                <p className="text-md font-bold text-gray-900">/ ساعة</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                        <div className="flex gap-2">
                            <button
                                onClick={onPreviousClick}
                                className="w-8 h-8 md:w-10 md:h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center transition duration-300 shadow-lg"
                            >
                                <FaArrowRight className="text-sm" />
                            </button>
                            <button
                                onClick={onNextClick}
                                className="w-8 h-8 md:w-10 md:h-10 bg-legacy-green hover:bg-primary-600 text-white rounded-lg flex items-center justify-center transition duration-300 shadow-lg"
                            >
                                <FaArrowLeft className="text-sm" />
                            </button>
                        </div>
                        <div>
                            <button
                                onClick={onViewAllTeachers}
                                className="bg-legacy-green hover:bg-primary-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-xs md:text-sm transition duration-300 flex items-center gap-3 shadow-lg"
                            >
                                عرض جميع المشاريع
                                <FaArrowLeft className="text-md" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
