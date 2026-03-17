import { Head, Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { FaClock, FaStar, FaUser, FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import { useTranslation } from '@/i18n';

export default function Courses({ auth, courses = [] }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const sampleCourses = [
        {
            id: 1,
            title: t('coursesPage.sampleCourses.programmingBasics.title'),
            description: t('coursesPage.sampleCourses.programmingBasics.description'),
            instructor: t('coursesPage.sampleCourses.programmingBasics.instructor'),
            duration: t('coursesPage.sampleCourses.programmingBasics.duration'),
            rating: 4.5,
            students: 150,
            image: '/images/course1.jpg',
            price: t('coursesPage.sampleCourses.programmingBasics.price')
        },
        {
            id: 2,
            title: t('coursesPage.sampleCourses.webDevelopment.title'),
            description: t('coursesPage.sampleCourses.webDevelopment.description'),
            instructor: t('coursesPage.sampleCourses.webDevelopment.instructor'),
            duration: t('coursesPage.sampleCourses.webDevelopment.duration'),
            rating: 4.8,
            students: 200,
            image: '/images/course2.jpg',
            price: t('coursesPage.sampleCourses.webDevelopment.price')
        },
        {
            id: 3,
            title: t('coursesPage.sampleCourses.graphicDesign.title'),
            description: t('coursesPage.sampleCourses.graphicDesign.description'),
            instructor: t('coursesPage.sampleCourses.graphicDesign.instructor'),
            duration: t('coursesPage.sampleCourses.graphicDesign.duration'),
            rating: 4.6,
            students: 120,
            image: '/images/course3.jpg',
            price: t('coursesPage.sampleCourses.graphicDesign.price')
        },
    ];

    const displayCourses = courses.length > 0 ? courses : sampleCourses;

    return (
        <MainLayout auth={auth}>
            <Head title={t('coursesPage.pageTitle', { appName: t('common.appName') })} />

            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('coursesPage.title')}</h1>
                <p className="text-lg text-gray-600">{t('coursesPage.subtitle')}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('coursesPage.searchPlaceholder')}
                            className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>{t('coursesPage.filters.allCategories')}</option>
                        <option>{t('coursesPage.filters.programming')}</option>
                        <option>{t('coursesPage.filters.design')}</option>
                        <option>{t('coursesPage.filters.business')}</option>
                        <option>{t('coursesPage.filters.marketing')}</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>{t('coursesPage.sort.latest')}</option>
                        <option>{t('coursesPage.sort.topRated')}</option>
                        <option>{t('coursesPage.sort.bestSelling')}</option>
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
                                <FaUser className="me-2" />
                                <span>{course.instructor}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <FaClock className="me-2" />
                                <span>{course.duration}</span>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <FaStar className="text-yellow-400 me-1" />
                                    <span className="font-semibold">{course.rating}</span>
                                    <span className="text-gray-500 text-sm ms-2">
                                        {t('coursesPage.studentsCount', { count: course.students })}
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">{course.price}</span>
                            </div>

                            <Link
                                href={`/courses/${course.id}`}
                                className="block w-full text-center bg-[#A3C042] text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                {t('coursesPage.viewDetails')}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {displayCourses.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">{t('coursesPage.noCourses')}</p>
                </div>
            )}
        </MainLayout>
    );
}
