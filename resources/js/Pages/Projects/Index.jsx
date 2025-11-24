import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { useState } from 'react';
import { FaSearch, FaProjectDiagram, FaEye, FaUser, FaCalendar, FaGraduationCap } from 'react-icons/fa';
import { toHijriDate } from '@/utils/dateUtils';

export default function ProjectsIndex({ auth, projects, userRole }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/projects', { search, category }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const categories = [
        { value: '', label: 'جميع الفئات' },
        { value: 'science', label: 'علوم' },
        { value: 'technology', label: 'تقنية' },
        { value: 'engineering', label: 'هندسة' },
        { value: 'mathematics', label: 'رياضيات' },
        { value: 'arts', label: 'فنون' },
        { value: 'other', label: 'أخرى' },
    ];

    return (
        <MainLayout auth={auth}>
            <Head title="المشاريع المعتمدة" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">المشاريع المعتمدة</h1>
                    <p className="text-gray-600">استعرض المشاريع المعتمدة من المدارس والمعلمين</p>
                </div>

                {/* البحث والفلترة */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ابحث عن مشروع..."
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="md:w-48">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            بحث
                        </button>
                    </form>
                </div>

                {/* قائمة المشاريع */}
                {projects.data && projects.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.data.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-300 overflow-hidden group"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <FaProjectDiagram className="text-blue-600 text-xl" />
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                                معتمد
                                            </span>
                                        </div>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                            {project.category === 'science' ? 'علوم' :
                                             project.category === 'technology' ? 'تقنية' :
                                             project.category === 'engineering' ? 'هندسة' :
                                             project.category === 'mathematics' ? 'رياضيات' :
                                             project.category === 'arts' ? 'فنون' : 'أخرى'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                                        {project.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {project.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-2">
                                            {project.teacher ? (
                                                <>
                                                    <FaGraduationCap className="text-gray-400" />
                                                    <span>{project.teacher.name || 'معلم'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaUser className="text-gray-400" />
                                                    <span>{project.user?.name || 'مستخدم'}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaEye className="text-gray-400" />
                                            <span>{project.views || 0}</span>
                                        </div>
                                    </div>

                                    {project.school && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            مدرسة: {project.school.name}
                                        </div>
                                    )}

                                    {project.approved_at && (
                                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                                            <FaCalendar />
                                            <span>معتمد في {toHijriDate(project.approved_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaProjectDiagram className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد مشاريع معتمدة حالياً</p>
                    </div>
                )}

                {/* Pagination */}
                {projects.links && projects.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            {projects.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-4 py-2 rounded-lg ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                            ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

