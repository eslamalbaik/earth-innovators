import { Head, Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { FaClock, FaStar, FaUser, FaSearch } from 'react-icons/fa';
import { useState } from 'react';

export default function Courses({ auth, courses = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const sampleCourses = [
        {
            id: 1,
            title: 'أساسيات البرمجة',
            description: 'تعلم أساسيات البرمجة من الصفر',
            instructor: 'أحمد محمد',
            duration: '8 ساعات',
            rating: 4.5,
            students: 150,
            image: '/images/course1.jpg',
            price: 'مجاني'
        },
        {
            id: 2,
            title: 'تطوير المواقع',
            description: 'تعلم تطوير المواقع الحديثة',
            instructor: 'سارة علي',
            duration: '12 ساعة',
            rating: 4.8,
            students: 200,
            image: '/images/course2.jpg',
            price: '99 ريال'
        },
        {
            id: 3,
            title: 'تصميم الجرافيك',
            description: 'احترف تصميم الجرافيك والإبداع',
            instructor: 'محمد خالد',
            duration: '10 ساعات',
            rating: 4.6,
            students: 120,
            image: '/images/course3.jpg',
            price: '79 ريال'
        },
    ];

    const displayCourses = courses.length > 0 ? courses : sampleCourses;

    return (
        <MainLayout auth={auth}>
            <Head title="الدورات التعليمية" />

            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">الدورات التعليمية</h1>
                <p className="text-lg text-gray-600">اكتشف مجموعة واسعة من الدورات في مختلف المجالات</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن دورة..."
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>جميع الفئات</option>
                        <option>البرمجة</option>
                        <option>التصميم</option>
                        <option>الأعمال</option>
                        <option>التسويق</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>الأحدث</option>
                        <option>الأعلى تقييماً</option>
                        <option>الأكثر مبيعاً</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayCourses.map((course) => (
                    <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                        <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                            <FaUser className="text-6xl text-white opacity-50" />
                        </div>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                            <div className="flex items-center text-sm text-gray-500 mb-2">
                                <FaUser className="ml-2" />
                                <span>{course.instructor}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <FaClock className="ml-2" />
                                <span>{course.duration}</span>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <FaStar className="text-yellow-400 ml-1" />
                                    <span className="font-semibold">{course.rating}</span>
                                    <span className="text-gray-500 text-sm mr-2">({course.students} طالب)</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">{course.price}</span>
                            </div>

                            <Link
                                href={`/courses/${course.id}`}
                                className="block w-full text-center bg-[#A3C042] text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                عرض التفاصيل
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {displayCourses.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">لا توجد دورات متاحة حالياً</p>
                </div>
            )}
        </MainLayout>
    );
}
