import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import {
    FaProjectDiagram,
    FaTrophy,
    FaMedal,
    FaStar,
    FaHeart,
    FaEdit,
    FaAward,
    FaCheckCircle,
    FaClock,
    FaTimes
} from 'react-icons/fa';

export default function StudentDashboard({ auth, stats = {} }) {
    const user = auth.user;
    const [showImageModal, setShowImageModal] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const imageForm = useForm({
        image: null,
    });

    const getStatusBadge = (status) => {
        const badges = {
            approved: { color: 'bg-green-100 text-green-700', label: 'تمت المراجعة', icon: FaCheckCircle },
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'قيد المراجعة', icon: FaClock },
            rejected: { color: 'bg-red-100 text-red-700', label: 'مرفوض', icon: FaClock },
        };
        return badges[status] || badges.pending;
    };

    const getActivityColor = (color) => {
        const colors = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            yellow: 'bg-yellow-500',
        };
        return colors[color] || 'bg-blue-500';
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // التحقق من نوع الملف
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
                alert('نوع الملف غير مدعوم. يرجى اختيار صورة من نوع JPEG, PNG, JPG, أو GIF');
                e.target.value = '';
                return;
            }

            // التحقق من حجم الملف (2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('حجم الملف كبير جداً. الحد الأقصى 2MB');
                e.target.value = '';
                return;
            }

            imageForm.setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleImageSubmit = (e) => {
        e.preventDefault();

        if (!imageForm.data.image) {
            alert('يرجى اختيار صورة');
            return;
        }

        // التحقق من نوع الملف
        const file = imageForm.data.image;

        // التأكد من أن الملف هو File object
        if (!(file instanceof File)) {
            alert('خطأ في الملف. يرجى المحاولة مرة أخرى.');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            alert('نوع الملف غير مدعوم. يرجى اختيار صورة من نوع JPEG, PNG, JPG, أو GIF');
            return;
        }

        const formData = new FormData();
        formData.append('image', file, file.name);
        formData.append('name', user.name || '');
        formData.append('email', user.email || '');
        formData.append('_method', 'PATCH');

        router.post(route('profile.update'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setShowImageModal(false);
                setImagePreview(null);
                imageForm.reset('image');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                // إعادة تحميل البيانات
                router.reload({
                    only: ['auth'],
                    preserveScroll: false,
                });
            },
            onError: (errors) => {
                console.error('Image update errors:', errors);
                if (errors.image) {
                    const errorMessage = Array.isArray(errors.image) ? errors.image[0] : errors.image;
                    alert('خطأ في رفع الصورة: ' + errorMessage);
                } else {
                    alert('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.');
                }
            },
        });
    };

    const getUserImage = () => {
        if (user.image) {
            // إذا كانت الصورة URL كامل أو مسار كامل
            if (user.image.startsWith('http') || user.image.startsWith('/storage/') || user.image.startsWith('/images/')) {
                return user.image;
            }
            // إذا كانت الصورة مسار نسبي
            return `/storage/${user.image}`;
        }
        return null;
    };

    return (
        <DashboardLayout header="لوحة تحكم الطالب">
            <Head title="لوحة تحكم الطالب - إرث المبتكرين" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* معلومات المستخدم */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            {/* صورة الملف الشخصي */}
                            <div className="relative">
                                {getUserImage() ? (
                                    <img
                                        src={getUserImage()}
                                        alt={user.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-legacy-green"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-legacy-green to-legacy-blue flex items-center justify-center text-white text-2xl font-bold">
                                        {user.name?.charAt(0) || 'ط'}
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowImageModal(true)}
                                    className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition shadow-lg"
                                >
                                    <FaEdit className="text-xs" />
                                </button>
                            </div>

                            {/* معلومات المستخدم */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
                                {stats.school && (
                                    <p className="text-gray-600 mb-3">{stats.school.name}</p>
                                )}

                                {/* العلامات */}
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                        مبتكر
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                                        مشارك نشط
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* أيقونات التنقل */}
                        <div className="flex gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 transition">
                                <FaStar className="text-blue-600" />
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-200 transition">
                                <FaTrophy className="text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* إحصائياتي */}
                <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">إحصائياتي</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{stats.totalPoints || 0}</p>
                            <p className="text-sm text-gray-600 mt-1">النقاط</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{stats.totalProjects || 0}</p>
                            <p className="text-sm text-gray-600 mt-1">المشاريع</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{stats.totalBadges || 0}</p>
                            <p className="text-sm text-gray-600 mt-1">الشارات</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{stats.winningProjects || 0}</p>
                            <p className="text-sm text-gray-600 mt-1">الفائزة</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* شاراتي */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">شاراتي</h3>
                            <Link href="/student/badges" className="text-green-600 hover:text-green-700 text-sm font-medium">
                                عرض الكل
                            </Link>
                        </div>
                        {stats.recentBadges && stats.recentBadges.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4">
                                {stats.recentBadges.map((badge, index) => (
                                    <div key={badge.id || index} className="text-center p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition">
                                        {badge.icon ? (
                                            <div className="text-4xl mb-2">{badge.icon}</div>
                                        ) : badge.image ? (
                                            <img src={badge.image} alt={badge.name} className="w-16 h-16 mx-auto mb-2 rounded-lg" />
                                        ) : (
                                            <div className={`w-16 h-16 mx-auto mb-2 rounded-lg flex items-center justify-center text-white text-2xl font-bold ${
                                                index === 0 ? 'bg-purple-500' :
                                                index === 1 ? 'bg-green-500' :
                                                'bg-blue-500'
                                            }`}>
                                                {index === 0 ? '3' : index === 1 ? '⭐' : '⭐'}
                                            </div>
                                        )}
                                        <p className="text-xs font-medium text-gray-700 mt-2">
                                            {badge.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FaMedal className="mx-auto text-4xl mb-2 text-gray-300" />
                                <p className="text-sm">لا توجد شارات بعد</p>
                            </div>
                        )}
                    </div>

                    {/* مشاريعي */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">مشاريعي</h3>
                            <Link href="/student/projects" className="text-green-600 hover:text-green-700 text-sm font-medium">
                                عرض الكل
                            </Link>
                        </div>
                        {stats.recentProjects && stats.recentProjects.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentProjects.slice(0, 2).map((project) => {
                                    const statusBadge = getStatusBadge(project.status);
                                    const StatusIcon = statusBadge.icon;
                                    return (
                                        <div key={project.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900 text-base">{project.title}</h4>
                                                <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                                    <StatusIcon className="text-xs" />
                                                    {statusBadge.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                                                    <FaStar className="text-yellow-500" />
                                                    <span className="text-sm font-medium text-gray-700">{project.rating || 5}</span>
                                                </div>
                                                <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                                                    <FaHeart className="text-red-500" />
                                                    <span className="text-sm font-medium text-gray-700">{project.likes || 12}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FaProjectDiagram className="mx-auto text-4xl mb-2 text-gray-300" />
                                <p className="text-sm">لا توجد مشاريع بعد</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* الإشعارات */}
                {stats.notifications && stats.notifications.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">الإشعارات</h3>
                            {stats.unreadCount > 0 && (
                                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {stats.unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="space-y-3">
                            {stats.notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notification.project_title ? `/student/projects` : '#'}
                                    className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-medium mb-1">{notification.message}</p>
                                            {notification.project_title && (
                                                <p className="text-sm text-gray-600 mb-1">المشروع: {notification.project_title}</p>
                                            )}
                                            {notification.rating && (
                                                <div className="flex items-center gap-1 mt-2" dir="ltr">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <FaStar
                                                            key={star}
                                                            className={`text-sm ${
                                                                star <= notification.rating
                                                                    ? 'text-yellow-400 fill-current'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">{notification.created_at}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* نشاطاتي */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">نشاطاتي</h3>
                    {stats.activities && stats.activities.length > 0 ? (
                        <div className="space-y-4">
                            {stats.activities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className={`w-3 h-3 rounded-full mt-2 ${getActivityColor(activity.color)}`}></div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-medium">
                                            {activity.action}: <span className="font-semibold">{activity.title}</span>
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">{activity.timeAgo}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FaClock className="mx-auto text-4xl mb-2 text-gray-300" />
                            <p className="text-sm">لا توجد نشاطات بعد</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal تعديل الصورة الشخصية */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">تعديل الصورة الشخصية</h3>
                            <button
                                onClick={() => {
                                    setShowImageModal(false);
                                    setImagePreview(null);
                                    imageForm.reset('image');
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleImageSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اختر صورة جديدة
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-legacy-green file:text-white hover:file:bg-legacy-blue"
                                />
                                {imagePreview && (
                                    <div className="mt-4">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-gray-300"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowImageModal(false);
                                        setImagePreview(null);
                                        imageForm.reset('image');
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={!imageForm.data.image || imageForm.processing}
                                    className="px-4 py-2 bg-legacy-green text-white rounded-lg hover:bg-legacy-blue transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {imageForm.processing ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
