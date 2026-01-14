import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import { useToast } from '@/Contexts/ToastContext';
import { FaChevronLeft, FaStar, FaMedal, FaBookmark, FaHeart, FaAward, FaEdit, FaCog, FaIdCard, FaArrowRight, FaTrophy, FaChartLine, FaGift, FaCamera, FaLock, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { getInitials, getColorFromName, getUserImageUrl } from '@/utils/imageUtils';

function StudentProfileContent({ user, stats = {}, badges = [], projects = [], activities = [], school, availableSchools = [], tags = [], onImageChange, imageInputRef, imagePreview, showPasswordModal, setShowPasswordModal, showDeleteModal, setShowDeleteModal, onSchoolChange, showSchoolModal, setShowSchoolModal, selectedSchoolId, setSelectedSchoolId }) {
    // Use real data from backend - no fallback to static data
    const displayStats = {
        points: stats?.points ?? 0,
        projects: stats?.projects ?? 0,
        badges: stats?.badges ?? 0,
        winning: stats?.winning ?? 0,
    };

    // Use real badges from backend
    const displayBadges = badges || [];

    // Use real projects from backend
    const displayProjects = projects || [];

    // Use real activities from backend
    const displayActivities = activities || [];

    const getUserImage = () => {
        if (imagePreview) return imagePreview;
        return getUserImageUrl(user);
    };

    const getBadgeIcon = (badge) => {
        // If badge has image, show it
        if (badge.image) {
            const imageUrl = badge.image.startsWith('/') ? badge.image : `/storage/${badge.image}`;
            return <img src={imageUrl} alt={badge.name_ar || badge.name} className="w-12 h-12 object-contain" />;
        }
        
        // Handle icon types
        if (badge.icon === '3' || badge.icon === 3) {
            return <span className="text-3xl font-black text-white">3</span>;
        }
        if (badge.icon === 'medal') {
            return <FaMedal className="text-3xl text-white" />;
        }
        if (badge.icon === 'star') {
            return <FaStar className="text-3xl text-white" />;
        }
        
        // Default icon
        return <FaAward className="text-3xl text-white" />;
    };

    const getBadgeBg = (color) => {
        if (color === 'purple') return 'from-purple-500 to-purple-700';
        if (color === 'green') return 'from-green-500 to-green-700';
        return 'from-blue-500 to-blue-700';
    };

    const getDot = (color) => {
        if (color === 'blue') return 'bg-blue-500';
        if (color === 'orange') return 'bg-yellow-500';
        if (color === 'green') return 'bg-green-500';
        return 'bg-gray-400';
    };

    const schoolName = school?.name || user?.school?.name || 'غير محدد';

    // Left Column Content (Header + Stats + Badges)
    const leftColumnContent = (
        <>
            {/* Header (as in screenshot) */}
            <div className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                    
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 relative">
                            {getUserImage() ? (
                                <img
                                    src={getUserImage()}
                                    alt={user?.name || 'User'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        const fallback = e.target.nextElementSibling;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className={`w-full h-full absolute inset-0 flex items-center justify-center text-white font-bold ${getUserImage() ? 'hidden' : 'flex'}`}
                                style={{ background: `linear-gradient(135deg, ${getColorFromName(user?.name || 'User')})` }}
                            >
                                {getInitials(user?.name || 'User')}
                            </div>
                        </div>

                        {/* Online dot */}
                        <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />

                        {/* Edit Image Button */}
                        <button
                            onClick={() => imageInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow hover:bg-green-600 transition"
                            aria-label="تعديل الصورة"
                        >
                            <FaCamera className="text-sm" />
                        </button>
                    </div>

                    {/* Name + tags */}
                    <div className="flex-1">
                        <div className="text-lg font-bold text-gray-900 leading-tight">{user?.name || 'المستخدم'}</div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (setShowSchoolModal) {
                                    setShowSchoolModal(true);
                                }
                            }}
                            className="text-sm text-gray-500 mt-1 hover:text-[#A3C042] transition flex items-center gap-1 cursor-pointer"
                        >
                            {schoolName}
                            <FaEdit className="text-xs" />
                        </button>
                        {tags && tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap justify-start gap-2">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className={`px-3 py-1 rounded-full ${tag.bgColor} ${tag.textColor} text-xs font-semibold`}
                                    >
                                        {tag.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Left floating actions */}
                    <div className="flex flex-col gap-3 pt-1">
                        <button 
                            type="button" 
                            onClick={() => setShowPasswordModal(true)}
                            className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow hover:bg-blue-200 transition"
                            aria-label="تغيير كلمة المرور"
                        >
                            <FaLock className="text-lg" />
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setShowDeleteModal(true)}
                            className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow hover:bg-red-200 transition"
                            aria-label="حذف الحساب"
                        >
                            <FaTrash className="text-lg" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100">
                <div className=" font-bold text-gray-900 mb-3">إحصائياتي</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                        <div className="text-lg font-extrabold text-gray-900">{displayStats.points}</div>
                        <div className="text-xs text-gray-500 mt-1">النقاط</div>
                    </div>
                    <div>
                        <div className="text-lg font-extrabold text-gray-900">{displayStats.projects}</div>
                        <div className="text-xs text-gray-500 mt-1">المشاريع</div>
                    </div>
                    <div>
                        <div className="text-lg font-extrabold text-gray-900">{displayStats.badges}</div>
                        <div className="text-xs text-gray-500 mt-1">الشارات</div>
                    </div>
                    <div>
                        <div className="text-lg font-extrabold text-gray-900">{displayStats.winning}</div>
                        <div className="text-xs text-gray-500 mt-1">الفائزة</div>
                    </div>
                </div>
            </div>

            {/* Quick Access Buttons */}
            <div className="grid grid-cols-2 gap-3">
                {/* الإنجازات */}
                <Link
                    href="/achievements"
                    className="group relative bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <FaTrophy className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                            <div className="text-white font-bold text-sm">الإنجازات</div>
                            <div className="text-white/80 text-xs mt-0.5">عرض جميع إنجازاتك</div>
                        </div>
                        <FaChevronLeft className="text-white/80 text-sm" />
                    </div>
                </Link>

                {/* النقاط */}
                <Link
                    href="/student/points"
                    className="group relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-20 h-20 bg-white/20 rounded-full -ml-10 -mt-10 blur-2xl"></div>
                    <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <FaChartLine className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                            <div className="text-white font-bold text-sm">النقاط</div>
                            <div className="text-white/80 text-xs mt-0.5">تتبع نقاطك</div>
                        </div>
                        <FaChevronLeft className="text-white/80 text-sm" />
                    </div>
                </Link>

                {/* بطاقة عضوية المتجر */}
                <Link
                    href="/store-membership"
                    className="group relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden col-span-2"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/15 rounded-full -ml-12 -mb-12 blur-2xl"></div>
                    <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <FaGift className="text-white text-2xl" />
                        </div>
                        <div className="flex-1">
                            <div className="text-white font-bold text-base">بطاقة عضوية المتجر</div>
                            <div className="text-white/90 text-xs mt-1">استبدل نقاطك بجوائز رائعة</div>
                        </div>
                        <FaChevronLeft className="text-white/80 text-base" />
                    </div>
                </Link>
            </div>

        </>
    );

    // Right Column Content (Projects + Activities)
    const rightColumnContent = (
        <>
                    {/* Badges */}
                    <div className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                <div className=" font-bold text-gray-900">شاراتي</div>
                    <Link href="/student/badges" className="text-[#A3C042] text-sm font-semibold">عرض الكل</Link>
                </div>

                {displayBadges.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                        {displayBadges.slice(0, 3).map((badge) => (
                            <div
                                key={badge.id}
                                className={`rounded-2xl bg-gradient-to-br ${getBadgeBg(badge.color || 'blue')} p-4 text-center shadow`}
                            >
                                <div className="flex justify-center mb-2">{getBadgeIcon(badge)}</div>
                                <div className="text-white text-xs font-bold leading-tight">{badge.name_ar || badge.name}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">لا توجد شارات مكتسبة بعد</div>
                )}
            </div>
            {/* Projects */}
            <div className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                <div className=" font-bold text-gray-900">مشاريعي</div>
                    <Link href="/student/projects" className="text-[#A3C042] text-sm font-semibold">عرض الكل</Link>
                </div>

                {displayProjects.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {displayProjects.slice(0, 2).map((project) => (
                            <div key={project.id} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-gray-900 line-clamp-1">{project.title}</span>
                                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                                        project.status === 'approved'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {project.status === 'approved' ? 'تمت المراجعة' : 'قيد المراجعة'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold">
                                    <div className="flex items-center gap-1 text-yellow-600">
                                        <FaBookmark />
                                        <span className="text-gray-900">{project.flags ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-red-600">
                                        <FaHeart />
                                        <span className="text-gray-900">{project.hearts ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">لا توجد مشاريع بعد</div>
                )}
            </div>

            {/* Activities */}
            <div className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100">
                <div className=" font-bold text-gray-900 mb-3">نشاطاتي</div>
                {displayActivities.length > 0 ? (
                    <div className="space-y-3">
                        {displayActivities.slice(0, 3).map((a) => (
                            <div key={a.id} className="flex items-start gap-3">
                                <div className={`${getDot(a.color || 'blue')} w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0`} />
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-900">{a.text}</div>
                                    <div className="text-xs text-gray-500 mt-1">{a.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">لا توجد نشاطات بعد</div>
                )}
            </div>
        </>
    );

    return (
        <>
            {/* Mobile View - Single Column */}
            <div className="space-y-6 md:hidden">
                {leftColumnContent}
                {rightColumnContent}
            </div>

            {/* Desktop View - Two Columns */}
            <div className="hidden md:grid md:grid-cols-2 md:gap-6 ">
                <div className="space-y-6">
                    {leftColumnContent}
                </div>
                <div className="space-y-6">
                    {rightColumnContent}
                </div>
            </div>
        </>
    );
}

export default function StudentProfile({ auth, stats = {}, badges = [], projects = [], activities = [], school = null, availableSchools = [], tags = [] }) {
    const user = auth?.user;
    const { flash } = usePage().props;
    const { showSuccess, showError } = useToast();
    const [imagePreview, setImagePreview] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSchoolModal, setShowSchoolModal] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState(school?.id || user?.school_id || null);
    const imageInputRef = useRef(null);

    // Show toast notifications from flash messages
    useEffect(() => {
        if (flash?.success) {
            showSuccess(flash.success);
        }
        if (flash?.error) {
            showError(flash.error);
        }
    }, [flash, showSuccess, showError]);

    const imageForm = useForm({
        image: null,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            imageForm.setData('image', file);
            setImagePreview(URL.createObjectURL(file));
            
            // Auto-submit image
            const formData = new FormData();
            formData.append('name', user?.name || '');
            formData.append('email', user?.email || '');
            formData.append('image', file);
            formData.append('_method', 'PATCH');

            router.post(route('profile.update'), formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    setImagePreview(null);
                    imageForm.reset('image');
                    // Reload auth data to get updated image
                    setTimeout(() => {
                        router.reload({
                            only: ['auth'],
                            preserveScroll: true,
                        });
                    }, 100);
                },
                onError: (errors) => {
                    console.error('Image update errors:', errors);
                    if (errors.image) {
                        alert('خطأ في رفع الصورة: ' + errors.image);
                    }
                    setImagePreview(null);
                },
            });
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setShowPasswordModal(false);
                alert('تم تحديث كلمة المرور بنجاح');
            },
            onError: (errors) => {
                console.error('Password update errors:', errors);
            },
        });
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        if (!confirm('هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك بشكل دائم.')) {
            return;
        }
        deleteForm.delete(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
            },
        });
    };

    const handleSchoolChange = (schoolId) => {
        router.post(route('student.profile.update-school'), {
            school_id: schoolId,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSchoolModal(false);
                // Flash message will be shown via useEffect
                router.reload({
                    only: ['auth', 'school', 'stats'],
                    preserveScroll: false,
                });
            },
            onError: (errors) => {
                console.error('School update errors:', errors);
                if (errors.school_id) {
                    showError('خطأ في تحديث المدرسة: ' + errors.school_id);
                } else if (errors.message) {
                    showError(errors.message);
                } else {
                    showError('حدث خطأ أثناء تحديث المدرسة');
                }
            },
        });
    };

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="الملف الشخصي - إرث المبتكرين" />

            {/* Mobile View (MobileAppLayout as requested) */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="الملف الشخصي"
                    activeNav="profile"
                    unreadCount={0}
                    onNotifications={() => router.visit('/profile')}
                    onBack={() => router.visit('/student/dashboard')}
                >
                    <StudentProfileContent 
                        user={user} 
                        stats={stats} 
                        badges={badges} 
                        projects={projects} 
                        activities={activities}
                        school={school}
                        availableSchools={availableSchools}
                        tags={tags}
                        onImageChange={handleImageChange}
                        imageInputRef={imageInputRef}
                        imagePreview={imagePreview}
                        showPasswordModal={showPasswordModal}
                        setShowPasswordModal={setShowPasswordModal}
                        showDeleteModal={showDeleteModal}
                        setShowDeleteModal={setShowDeleteModal}
                        onSchoolChange={handleSchoolChange}
                        showSchoolModal={showSchoolModal}
                        setShowSchoolModal={setShowSchoolModal}
                        selectedSchoolId={selectedSchoolId}
                        setSelectedSchoolId={setSelectedSchoolId}
                    />
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="الملف الشخصي"
                    unreadCount={0}
                    onNotifications={() => router.visit('/profile')}
                    onBack={() => router.visit('/student/dashboard')}
                    rightIcon={FaCog}
                    leftIcon={FaArrowRight}
                    reverseOrder={true}
                    showLogo={false}
                />
                <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6">
                    <div className="mx-auto w-full">
                        <StudentProfileContent 
                            user={user} 
                            stats={stats} 
                            badges={badges} 
                            projects={projects} 
                            activities={activities}
                            school={school}
                            availableSchools={availableSchools}
                            tags={tags}
                            onImageChange={handleImageChange}
                            imageInputRef={imageInputRef}
                            imagePreview={imagePreview}
                            showPasswordModal={showPasswordModal}
                            setShowPasswordModal={setShowPasswordModal}
                            showDeleteModal={showDeleteModal}
                            setShowDeleteModal={setShowDeleteModal}
                            onSchoolChange={handleSchoolChange}
                            showSchoolModal={showSchoolModal}
                            setShowSchoolModal={setShowSchoolModal}
                            selectedSchoolId={selectedSchoolId}
                            setSelectedSchoolId={setSelectedSchoolId}
                        />
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>
                </main>
                <MobileBottomNav active="profile" role={user?.role} isAuthed={!!user} user={user} />
            </div>

            {/* Password Change Modal */}
            <Modal show={showPasswordModal} onClose={() => setShowPasswordModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FaLock />
                            تغيير كلمة المرور
                        </h2>
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                كلمة المرور الحالية *
                            </label>
                            <input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                                required
                            />
                            {passwordForm.errors.current_password && (
                                <p className="text-red-500 text-sm mt-1">{passwordForm.errors.current_password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                كلمة المرور الجديدة *
                            </label>
                            <input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                                required
                                minLength="8"
                            />
                            {passwordForm.errors.password && (
                                <p className="text-red-500 text-sm mt-1">{passwordForm.errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                تأكيد كلمة المرور *
                            </label>
                            <input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                                required
                            />
                            {passwordForm.errors.password_confirmation && (
                                <p className="text-red-500 text-sm mt-1">{passwordForm.errors.password_confirmation}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="flex-1 bg-[#A3C042] hover:bg-[#93b03a] text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                            >
                                <FaSave />
                                {passwordForm.processing ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Account Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                            <FaTrash />
                            حذف الحساب
                        </h2>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg mb-6">
                        <p className="text-red-800 font-medium mb-2">تحذير!</p>
                        <p className="text-red-700 text-sm">
                            عند حذف حسابك، سيتم حذف جميع بياناتك بشكل دائم ولن تتمكن من استرجاعها.
                            يرجى التأكد قبل المتابعة.
                        </p>
                    </div>

                    <form onSubmit={handleDeleteAccount} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                كلمة المرور للتأكيد *
                            </label>
                            <input
                                type="password"
                                value={deleteForm.data.password}
                                onChange={(e) => deleteForm.setData('password', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                required
                                autoFocus
                            />
                            {deleteForm.errors.password && (
                                <p className="text-red-500 text-sm mt-1">{deleteForm.errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                            >
                                إلغاء
                            </button>
                            <DangerButton
                                type="submit"
                                disabled={deleteForm.processing}
                                className="flex-1"
                            >
                                {deleteForm.processing ? 'جاري الحذف...' : 'حذف الحساب'}
                            </DangerButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* School Change Modal */}
            <Modal show={showSchoolModal} onClose={() => setShowSchoolModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FaIdCard />
                            تغيير المدرسة
                        </h2>
                        <button
                            onClick={() => setShowSchoolModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المدرسة الحالية
                            </label>
                            <div className="text-base font-bold text-gray-900">{school?.name || user?.school?.name || 'غير محدد'}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اختر مدرسة جديدة
                            </label>
                            <select
                                value={selectedSchoolId || ''}
                                onChange={(e) => setSelectedSchoolId(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                            >
                                <option value="">اختر مدرسة</option>
                                {availableSchools.map((schoolOption) => (
                                    <option key={schoolOption.id} value={schoolOption.id}>
                                        {schoolOption.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowSchoolModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (selectedSchoolId && selectedSchoolId !== (school?.id || user?.school_id)) {
                                        handleSchoolChange(selectedSchoolId);
                                    } else {
                                        alert('يرجى اختيار مدرسة مختلفة');
                                    }
                                }}
                                disabled={!selectedSchoolId || selectedSchoolId === (school?.id || user?.school_id)}
                                className="flex-1 bg-[#A3C042] hover:bg-[#93b03a] text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaSave />
                                حفظ التغيير
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
