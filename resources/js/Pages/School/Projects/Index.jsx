import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FaBook, FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { toHijriDate } from '@/utils/dateUtils';
import { useToast } from '@/Contexts/ToastContext';
import { useEffect } from 'react';

export default function SchoolProjects({ projects, auth }) {
    const { flash } = usePage().props;
    const { showSuccess } = useToast();
    const { data, setData, get } = useForm({
        search: '',
        status: '',
        category: '',
    });

    const categoryColors = {
        science: 'bg-blue-100 text-blue-700',
        technology: 'bg-purple-100 text-purple-700',
        engineering: 'bg-orange-100 text-orange-700',
        mathematics: 'bg-green-100 text-green-700',
        arts: 'bg-pink-100 text-pink-700',
        other: 'bg-gray-100 text-gray-700',
    };

    const categoryLabels = {
        science: 'علوم',
        technology: 'تقني',
        engineering: 'هندسة',
        mathematics: 'رياضيات',
        arts: 'فنون',
        other: 'أخرى',
    };

    const statusLabels = {
        pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700' },
        approved: { label: 'موافق', color: 'bg-green-100 text-green-700' },
        rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
    };

    const handleSearch = (e) => {
        e.preventDefault();
        get('/school/projects', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDelete = (projectId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
            // استخدام router.post مع _method: DELETE للتوافق مع Laravel
            router.post(`/school/projects/${projectId}`, {
                _method: 'DELETE',
            }, {
                preserveScroll: false,
                onSuccess: () => {
                    showSuccess('تم حذف المشروع بنجاح');
                    // إعادة تحميل قائمة المشاريع بعد الحذف
                    router.reload({ only: ['projects'] });
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    alert('حدث خطأ أثناء حذف المشروع');
                },
            });
        }
    };

    // عرض رسالة النجاح
    useEffect(() => {
        if (flash?.success) {
            showSuccess(flash.success);
        }
    }, [flash?.success, showSuccess]);

    return (
        <DashboardLayout header="مشاريع المدرسة">
            <Head title="مشاريع المدرسة - إرث المبتكرين" />

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">مشاريع المدرسة</h2>
                <Link
                    href="/school/projects/create"
                    className="bg-gradient-to-r from-legacy-green to-legacy-blue text-white px-6 py-3 rounded-lg font-semibold transition duration-300 flex items-center gap-2 shadow-md hover:shadow-xl"
                >
                    <FaPlus />
                    إنشاء مشروع جديد
                </Link>
            </div>

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
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            <option value="">جميع الحالات</option>
                            <option value="pending">قيد المراجعة</option>
                            <option value="approved">موافق</option>
                            <option value="rejected">مرفوض</option>
                        </SelectInput>
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
                        <FaBook className="text-legacy-green" />
                        جميع المشاريع ({projects.total || 0})
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
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[project.category] || categoryColors.other}`}>
                                                    {categoryLabels[project.category] || 'أخرى'}
                                                </span>
                                                {statusLabels[project.status] && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusLabels[project.status].color}`}>
                                                        {statusLabels[project.status].label}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-700 mb-2 line-clamp-2">{project.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>الطالب: {project.user?.name || 'المدرسة'}</span>
                                                <span>•</span>
                                                <span>تاريخ: {toHijriDate(project.created_at)}</span>
                                                {project.points_earned > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{project.points_earned} نقطة</span>
                                                    </>
                                                )}
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
                                            {(project.user_id === auth.user.id || project.school_id === auth.user.id || project.teacher_id) && (
                                                <>
                                                    <Link
                                                        href={`/school/projects/${project.id}/edit`}
                                                        className="bg-legacy-green hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                                    >
                                                        <FaEdit />
                                                        تعديل
                                                    </Link>
                                                    <button
                                                        onClick={(e) => handleDelete(project.id, e)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                                    >
                                                        <FaTrash />
                                                        حذف
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">لا توجد مشاريع</p>
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

