import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaSearch } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { toHijriDate } from '@/utils/dateUtils';

export default function PendingProjects({ projects, auth }) {
    const { data, setData, get } = useForm({
        search: '',
        category: '',
    });

    const categoryColors = {
        science: 'bg-blue-100 text-blue-700 border-blue-300',
        technology: 'bg-purple-100 text-purple-700 border-purple-300',
        engineering: 'bg-orange-100 text-orange-700 border-orange-300',
        mathematics: 'bg-green-100 text-green-700 border-green-300',
        arts: 'bg-pink-100 text-pink-700 border-pink-300',
        other: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    const categoryLabels = {
        science: 'علوم',
        technology: 'تقني',
        engineering: 'هندسة',
        mathematics: 'رياضيات',
        arts: 'فنون',
        other: 'أخرى',
    };

    const handleSearch = (e) => {
        e.preventDefault();
        get('/school/projects/pending', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleApprove = (projectId) => {
        if (confirm('هل أنت متأكد من قبول هذا المشروع؟')) {
            router.post(`/school/projects/${projectId}/approve`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleReject = (projectId) => {
        if (confirm('هل أنت متأكد من رفض هذا المشروع؟')) {
            router.post(`/school/projects/${projectId}/reject`, {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <DashboardLayout header="المشاريع المعلقة للمراجعة">
            <Head title="المشاريع المعلقة - إرث المبتكرين" />

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                        <TextInput
                            type="text"
                            placeholder="ابحث عن المشاريع..."
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="w-48">
                        <SelectInput
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                        >
                            <option value="">جميع الفئات</option>
                            <option value="science">علوم</option>
                            <option value="technology">تقني</option>
                            <option value="engineering">هندسة</option>
                            <option value="mathematics">رياضيات</option>
                            <option value="arts">فنون</option>
                            <option value="other">أخرى</option>
                        </SelectInput>
                    </div>
                    <PrimaryButton type="submit">
                        <FaSearch className="inline ml-2" />
                        بحث
                    </PrimaryButton>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FaClock className="text-legacy-green" />
                        المشاريع المعلقة للمراجعة ({projects.total || 0})
                    </h3>
                </div>
                <div className="p-6">
                    {projects.data && projects.data.length > 0 ? (
                        <div className="space-y-4">
                            {projects.data.map((project) => (
                                <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h4 className="text-xl font-bold text-gray-900">{project.title}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[project.category] || categoryColors.other}`}>
                                                    {categoryLabels[project.category] || 'أخرى'}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 mb-2 line-clamp-2">{project.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                {project.school && (
                                                    <>
                                                        <span><strong>المدرسة:</strong> {project.school.name}</span>
                                                        <span>•</span>
                                                    </>
                                                )}
                                                {project.teacher ? (
                                                    <>
                                                        <span><strong>المعلم:</strong> {project.teacher.name_ar || project.teacher.user?.name || 'غير محدد'}</span>
                                                        <span>•</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span><strong>الطالب:</strong> {project.user?.name || project.student_name}</span>
                                                        <span>•</span>
                                                    </>
                                                )}
                                                <span>تاريخ الإرسال: {toHijriDate(project.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mr-6">
                                            <Link
                                                href={`/school/projects/${project.id}`}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2"
                                            >
                                                <FaEye />
                                                عرض
                                            </Link>
                                            <button
                                                onClick={() => handleApprove(project.id)}
                                                className="bg-legacy-green hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                            >
                                                <FaCheckCircle />
                                                قبول
                                            </button>
                                            <button
                                                onClick={() => handleReject(project.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                            >
                                                <FaTimesCircle />
                                                رفض
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">لا توجد مشاريع معلقة للمراجعة</p>
                        </div>
                    )}

                    {projects.links && projects.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {projects.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            link.active
                                                ? 'bg-gradient-to-r from-legacy-green to-legacy-blue text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

