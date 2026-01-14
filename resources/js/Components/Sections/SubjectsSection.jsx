import { Link } from '@inertiajs/react';
import SectionTitle from '../SectionTitle';
import { FaArrowDown } from 'react-icons/fa';

export default function SubjectsSection({
    title = "استكشف المشاريع بحسب المجالات",
    subtitle = "تصفح المشاريع الإبداعية في مختلف المجالات: العلوم، التكنولوجيا، الهندسة، الرياضيات، والفنون.",
    subjects = [],
    browseAllLink = "/projects",
    onSubjectClick
}) {
    return (
        <section className="py-16 bg-gradient-to-r from-[#A3C042]/5 to-legacy-blue/5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-8">
                    <div className="text-center">
                        <SectionTitle
                            text={title}
                            size="2xl"
                            align="center"
                            className="pb-2"
                        />

                        <p className="text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {subjects.length > 0 ? (
                            subjects.map((subject) => {
                                const subjectName = subject.name_ar || subject.name || subject.name_en;
                                const teacherCount = subject.teacher_count !== undefined && subject.teacher_count !== null
                                    ? `${subject.teacher_count} معلم`
                                    : '0 معلم';
                                const subjectImage = subject.image || '/images/subjects/default.png';

                                return (
                                    <div
                                        key={subject.id}
                                        className="w-full h-80"
                                        onClick={() => onSubjectClick && onSubjectClick(subject)}
                                    >
                                        <div className="bg-white rounded-t-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer text-center h-64 overflow-hidden">
                                            <img
                                                src={subjectImage}
                                                alt={subjectName}
                                                className="w-full h-full object-cover rounded-t-lg"
                                                onError={(e) => {
                                                    e.target.src = '/images/subjects/default.png';
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center gap-2 px-3 bg-white rounded-b-lg shadow-lg hover:shadow-xl transition duration-300 cursor-pointer py-4">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">{subjectName}</h3>
                                            <p className="text-sm text-gray-600">{teacherCount}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-8">
                                <p className="text-gray-500">لا توجد مواد متاحة حالياً</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-8">
                        <Link
                            href={browseAllLink}
                            className="inline-flex items-center gap-2 bg-[#A3C042] hover:bg-primary-600 text-white px-4 py-2 md:px-8 md:py-4 rounded-lg font-bold text-md md:text-lg transition duration-300 transform hover:scale-105 shadow-md"
                        >
                            تصفح كل المواد
                            <FaArrowDown className="text-sm" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
