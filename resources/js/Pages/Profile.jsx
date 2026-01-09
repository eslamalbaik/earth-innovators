import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaCamera,
    FaSave,
    FaEdit,
    FaTrash,
    FaTimes,
    FaMapMarkerAlt,
    FaGraduationCap,
    FaDollarSign,
    FaCheckCircle,
    FaPhone,
    FaMedal,
    FaAward,
    FaBell,
    FaSignOutAlt,
    FaChartLine,
    FaFileAlt,
    FaBuilding,
    FaEye,
    FaEyeSlash,
} from 'react-icons/fa';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';

export default function Profile({ auth, mustVerifyEmail, status, teacher, subjects, cities, badges = [], admin_stats = null, notification_preferences = null }) {
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('basic');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [teacherImagePreview, setTeacherImagePreview] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [notificationPrefs, setNotificationPrefs] = useState({
        email_notifications: notification_preferences?.email_notifications ?? true,
        popup_notifications: notification_preferences?.popup_notifications ?? true,
        platform_updates: notification_preferences?.platform_updates ?? false,
    });
    const [savingPreferences, setSavingPreferences] = useState(false);
    const imageInputRef = useRef(null);
    const teacherImageInputRef = useRef(null);
    const coverImageInputRef = useRef(null);

    const basicForm = useForm({
        name: user.name || '',
        email: user.email || '',
        image: null,
        institution: user.institution || '',
        bio: user.bio || '',
    });

    const teacherForm = useForm({
        name_ar: teacher?.name_ar || '',
        name_en: teacher?.name_en || '',
        nationality: teacher?.nationality || '',
        gender: teacher?.gender || '',
        bio: teacher?.bio || '',
        qualifications: teacher?.qualifications || '',
        subjects: teacher?.subjects || [],
        stages: teacher?.stages || [],
        experience_years: teacher?.experience_years || 0,
        city: teacher?.city || '',
        neighborhoods: teacher?.neighborhoods || [],
        price_per_hour: teacher?.price_per_hour || 0,
        teacher_image: null,
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
            basicForm.setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleTeacherImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            teacherForm.setData('teacher_image', file);
            setTeacherImagePreview(URL.createObjectURL(file));
        }
    };

    const handleBasicSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', basicForm.data.name);
        formData.append('email', basicForm.data.email);
        if (basicForm.data.image) {
            formData.append('image', basicForm.data.image);
        }
        formData.append('_method', 'PATCH');

        router.post(route('profile.update'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setImagePreview(null);
                basicForm.reset('image');
                setTimeout(() => {
                    router.reload({
                        only: ['auth', 'teacher'],
                        preserveScroll: false,
                    });
                }, 100);
            },
            onError: (errors) => {
                console.error('Profile update errors:', errors);
                if (errors.image) {
                    alert('خطأ في رفع الصورة: ' + errors.image);
                }
            },
        });
    };

    const handleTeacherSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        formData.append('name', user.name || basicForm.data.name || '');
        formData.append('email', user.email || basicForm.data.email || '');
        
        Object.keys(teacherForm.data).forEach(key => {
            if (key !== 'teacher_image') {
                if (Array.isArray(teacherForm.data[key])) {
                    teacherForm.data[key].forEach((item, index) => {
                        formData.append(`teacher_data[${key}][${index}]`, item);
                    });
                } else {
                    formData.append(`teacher_data[${key}]`, teacherForm.data[key]);
                }
            }
        });
        if (teacherForm.data.teacher_image) {
            formData.append('teacher_image', teacherForm.data.teacher_image);
        }

        formData.append('_method', 'PATCH');

        router.post(route('profile.update'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setTeacherImagePreview(null);
                teacherForm.reset();
                setTimeout(() => {
                    router.reload({
                        only: ['auth', 'teacher'],
                        preserveScroll: false,
                    });
                }, 100);
            },
            onError: (errors) => {
                console.error('Teacher profile update errors:', errors);
                let errorMessage = 'حدث خطأ أثناء حفظ البيانات:\n';
                if (errors.teacher_image) {
                    errorMessage += 'الصورة: ' + (Array.isArray(errors.teacher_image) ? errors.teacher_image.join(', ') : errors.teacher_image) + '\n';
                }
                if (errors.name) {
                    errorMessage += 'الاسم: ' + (Array.isArray(errors.name) ? errors.name.join(', ') : errors.name) + '\n';
                }
                if (errors.email) {
                    errorMessage += 'البريد الإلكتروني: ' + (Array.isArray(errors.email) ? errors.email.join(', ') : errors.email) + '\n';
                }
                Object.keys(errors).forEach(key => {
                    if (!['teacher_image', 'name', 'email'].includes(key)) {
                        errorMessage += `${key}: ${Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key]}\n`;
                    }
                });
                alert(errorMessage);
            },
        });
    };

    // Calculate password strength
    const calculatePasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: 'gray' };

        let strength = 0;
        let checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        };

        if (checks.length) strength += 1;
        if (checks.lowercase) strength += 1;
        if (checks.uppercase) strength += 1;
        if (checks.numbers) strength += 1;
        if (checks.special) strength += 1;

        if (password.length >= 12) strength += 1;

        if (strength <= 2) {
            return { strength, label: 'ضعيفة', color: 'red', percentage: 33 };
        } else if (strength <= 4) {
            return { strength, label: 'متوسطة', color: 'yellow', percentage: 66 };
        } else {
            return { strength, label: 'قوية', color: 'green', percentage: 100 };
        }
    };

    const passwordStrength = calculatePasswordStrength(passwordForm.data.password);
    const isPasswordStrong = passwordStrength.strength >= 5;

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        
        // Validate password strength
        if (!isPasswordStrong) {
            alert('كلمة المرور يجب أن تكون قوية. يرجى استخدام مزيج من الأحرف الكبيرة والصغيرة والأرقام والرموز الخاصة.');
            return;
        }

        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setShowCurrentPassword(false);
                setShowPassword(false);
                setShowPasswordConfirmation(false);
            },
        });
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        deleteForm.delete('/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
            },
        });
    };

    const handleNotificationPreferenceUpdate = async (preferenceType, value) => {
        setSavingPreferences(true);
        try {
            const response = await axios.put('/notification-preferences', {
                [preferenceType]: value,
            });
            
            // Update local state
            setNotificationPrefs(prev => ({
                ...prev,
                [preferenceType]: value
            }));
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            // Revert the change on error
            setNotificationPrefs(prev => ({
                ...prev,
                [preferenceType]: !value
            }));
            alert('حدث خطأ أثناء تحديث تفضيلات الإشعارات. يرجى المحاولة مرة أخرى.');
        } finally {
            setSavingPreferences(false);
        }
    };

    const handleSubjectChange = (subjectName) => {
        const currentSubjects = teacherForm.data.subjects;
        if (currentSubjects.includes(subjectName)) {
            teacherForm.setData('subjects', currentSubjects.filter(s => s !== subjectName));
        } else {
            teacherForm.setData('subjects', [...currentSubjects, subjectName]);
        }
    };

    const handleStageChange = (stage) => {
        const currentStages = teacherForm.data.stages;
        if (currentStages.includes(stage)) {
            teacherForm.setData('stages', currentStages.filter(s => s !== stage));
        } else {
            teacherForm.setData('stages', [...currentStages, stage]);
        }
    };

    const handleNeighborhoodChange = (neighborhood) => {
        const currentNeighborhoods = teacherForm.data.neighborhoods;
        if (currentNeighborhoods.includes(neighborhood)) {
            teacherForm.setData('neighborhoods', currentNeighborhoods.filter(n => n !== neighborhood));
        } else {
            teacherForm.setData('neighborhoods', [...currentNeighborhoods, neighborhood]);
        }
    };

    const getDisplayImage = () => {
        if (user.role === 'teacher') {
            if (teacher?.image) {
                if (teacher.image.startsWith('http://') || teacher.image.startsWith('https://')) {
                    return teacher.image;
                }
                if (teacher.image.startsWith('/storage/')) {
                    return teacher.image;
                }
                return `/storage/${teacher.image}`;
            }
            if (user.teacher?.image) {
                if (user.teacher.image.startsWith('http://') || user.teacher.image.startsWith('https://')) {
                    return user.teacher.image;
                }
                if (user.teacher.image.startsWith('/storage/')) {
                    return user.teacher.image;
                }
                return `/storage/${user.teacher.image}`;
            }
            if (teacherImagePreview) {
                return teacherImagePreview;
            }
        }

        if (user.image) {
            if (user.image.startsWith('http://') || user.image.startsWith('https://')) {
                return user.image;
            }
            if (user.image.startsWith('/storage/')) {
                return user.image;
            }
            const imagePath = user.image.startsWith('storage/')
                ? `/${user.image}`
                : `/storage/${user.image}`;
            return imagePath;
        }

        if (imagePreview) {
            return imagePreview;
        }

        return null;
    };

    const getDisplayName = () => {
        if (user.role === 'teacher' && teacher?.name_ar) {
            return teacher.name_ar;
        }
        return user.name;
    };

    // Admin-specific profile design
    if (user.role === 'admin') {
        return (
            <DashboardLayout header="الملف الشخصي">
                <Head title="الملف الشخصي - الأدمن" />

                <div className="max-w-7xl mx-auto">
                    {/* Cover Section */}
                    <div className="relative mb-6 rounded-xl overflow-hidden">
                        <div className="h-48 bg-gradient-to-r from-green-600 to-green-800 relative">
                            {coverImagePreview ? (
                                <img src={coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-800"></div>
                            )}
                            <button
                                onClick={() => coverImageInputRef.current?.click()}
                                className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                            >
                                <FaEdit className="text-sm" />
                                تعديل الغلاف
                            </button>
                            <input
                                ref={coverImageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setCoverImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                                className="hidden"
                            />
                        </div>
                        
                        {/* Profile Header */}
                        <div className="bg-gray-50 px-6 py-6">
                            <div className="flex items-start gap-6">
                                <div className="relative -mt-16">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                                        {getDisplayImage() ? (
                                            <>
                                                <img
                                                    src={getDisplayImage()}
                                                    alt={getDisplayName()}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.nextElementSibling;
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="hidden w-full h-full items-center justify-center">
                                                    {getDisplayName()?.charAt(0)?.toUpperCase() || 'A'}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                {getDisplayName()?.charAt(0)?.toUpperCase() || 'A'}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => imageInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg transition"
                                    >
                                        <FaCamera className="text-sm" />
                                    </button>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex-1 flex items-start justify-between mt-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            {getDisplayName()}
                                        </h1>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                                                <FaCheckCircle className="text-xs" />
                                                مدير النظام (Super Admin)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaEnvelope className="text-sm" />
                                            <span>{user.email}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <a
                                            href="/logout"
                                            method="post"
                                            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                                        >
                                            <FaSignOutAlt />
                                            تسجيل الخروج
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-4">
                                <nav className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab('basic')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                                            activeTab === 'basic'
                                                ? 'bg-green-100 text-green-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <FaUser className="text-lg" />
                                        المعلومات الأساسية
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('password')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                                            activeTab === 'password'
                                                ? 'bg-green-100 text-green-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <FaLock className="text-lg" />
                                        الأمان وكلمة المرور
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('notifications')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                                            activeTab === 'notifications'
                                                ? 'bg-green-100 text-green-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <FaBell className="text-lg" />
                                        إشعارات النظام
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                {activeTab === 'basic' && (
                                    <form onSubmit={handleBasicSubmit}>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">الملف الشخصي</h2>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    الاسم الكامل
                                                </label>
                                                <input
                                                    type="text"
                                                    value={basicForm.data.name}
                                                    onChange={(e) => basicForm.setData('name', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                                    required
                                                />
                                                {basicForm.errors.name && (
                                                    <p className="text-red-500 text-sm mt-1">{basicForm.errors.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    المدرسة / المؤسسة
                                                </label>
                                                <input
                                                    type="text"
                                                    value={basicForm.data.institution}
                                                    onChange={(e) => basicForm.setData('institution', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                                    placeholder="إدارة إرث المبتكرين"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    نبذة تعريفية
                                                </label>
                                                <textarea
                                                    value={basicForm.data.bio}
                                                    onChange={(e) => basicForm.setData('bio', e.target.value)}
                                                    rows="4"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                                    placeholder="أعمل على تطوير بيئة ابتكارية محفزة للطلاب ودعم المشاريع التقنية والريادية في المدرسة."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    البريد الإلكتروني
                                                </label>
                                                <input
                                                    type="email"
                                                    value={basicForm.data.email}
                                                    onChange={(e) => basicForm.setData('email', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                                    required
                                                />
                                                {basicForm.errors.email && (
                                                    <p className="text-red-500 text-sm mt-1">{basicForm.errors.email}</p>
                                                )}
                                            </div>

                                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                                <button
                                                    type="submit"
                                                    disabled={basicForm.processing}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
                                                >
                                                    <FaSave />
                                                    {basicForm.processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                {activeTab === 'password' && (
                                    <form onSubmit={handlePasswordSubmit}>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">الأمان وكلمة المرور</h2>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    كلمة المرور الحالية *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        value={passwordForm.data.current_password}
                                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-green-400"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                                    >
                                                        {showCurrentPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                                    </button>
                                                </div>
                                                {passwordForm.errors.current_password && (
                                                    <p className="text-red-500 text-sm mt-1">{passwordForm.errors.current_password}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    كلمة المرور الجديدة *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={passwordForm.data.password}
                                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                        className={`w-full border rounded-lg px-4 py-2 pr-12 focus:ring-2 ${
                                                            passwordForm.data.password
                                                                ? passwordStrength.color === 'red'
                                                                    ? 'border-red-300 focus:ring-red-400'
                                                                    : passwordStrength.color === 'yellow'
                                                                    ? 'border-yellow-300 focus:ring-yellow-400'
                                                                    : 'border-green-300 focus:ring-green-400'
                                                                : 'border-gray-300 focus:ring-green-400'
                                                        }`}
                                                        required
                                                        minLength="8"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                                    >
                                                        {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                                    </button>
                                                </div>
                                                
                                                {/* Password Strength Indicator */}
                                                {passwordForm.data.password && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-medium text-gray-600">قوة كلمة المرور:</span>
                                                            <span className={`text-xs font-bold ${
                                                                passwordStrength.color === 'red' ? 'text-red-600' :
                                                                passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                                                                'text-green-600'
                                                            }`}>
                                                                {passwordStrength.label}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                                    passwordStrength.color === 'red' ? 'bg-red-500' :
                                                                    passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                                                                    'bg-green-500'
                                                                }`}
                                                                style={{ width: `${passwordStrength.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-600">
                                                            <p className="mb-1">يجب أن تحتوي كلمة المرور على:</p>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                <li className={passwordForm.data.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                                                                    على الأقل 8 أحرف
                                                                </li>
                                                                <li className={/[a-z]/.test(passwordForm.data.password) ? 'text-green-600' : 'text-gray-500'}>
                                                                    حرف صغير (a-z)
                                                                </li>
                                                                <li className={/[A-Z]/.test(passwordForm.data.password) ? 'text-green-600' : 'text-gray-500'}>
                                                                    حرف كبير (A-Z)
                                                                </li>
                                                                <li className={/[0-9]/.test(passwordForm.data.password) ? 'text-green-600' : 'text-gray-500'}>
                                                                    رقم (0-9)
                                                                </li>
                                                                <li className={/[^A-Za-z0-9]/.test(passwordForm.data.password) ? 'text-green-600' : 'text-gray-500'}>
                                                                    رمز خاص (!@#$%^&*)
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {passwordForm.errors.password && (
                                                    <p className="text-red-500 text-sm mt-1">{passwordForm.errors.password}</p>
                                                )}
                                                
                                                {passwordForm.data.password && !isPasswordStrong && (
                                                    <p className="text-red-500 text-sm mt-2">
                                                        ⚠️ كلمة المرور يجب أن تكون قوية لتتمكن من حفظها
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    تأكيد كلمة المرور *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswordConfirmation ? "text" : "password"}
                                                        value={passwordForm.data.password_confirmation}
                                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                        className={`w-full border rounded-lg px-4 py-2 pr-12 focus:ring-2 ${
                                                            passwordForm.data.password_confirmation
                                                                ? passwordForm.data.password === passwordForm.data.password_confirmation
                                                                    ? 'border-green-300 focus:ring-green-400'
                                                                    : 'border-red-300 focus:ring-red-400'
                                                                : 'border-gray-300 focus:ring-green-400'
                                                        }`}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                                    >
                                                        {showPasswordConfirmation ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                                    </button>
                                                </div>
                                                {passwordForm.data.password_confirmation && passwordForm.data.password !== passwordForm.data.password_confirmation && (
                                                    <p className="text-red-500 text-sm mt-1">كلمة المرور غير متطابقة</p>
                                                )}
                                                {passwordForm.errors.password_confirmation && (
                                                    <p className="text-red-500 text-sm mt-1">{passwordForm.errors.password_confirmation}</p>
                                                )}
                                            </div>

                                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                                <button
                                                    type="submit"
                                                    disabled={passwordForm.processing || !isPasswordStrong || passwordForm.data.password !== passwordForm.data.password_confirmation}
                                                    className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition ${
                                                        isPasswordStrong && passwordForm.data.password === passwordForm.data.password_confirmation
                                                            ? 'bg-green-500 hover:bg-green-600 text-white'
                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <FaSave />
                                                    {passwordForm.processing ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                {activeTab === 'notifications' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">إشعارات النظام</h2>
                                        
                                        <div className="space-y-6">
                                            {/* Email Notifications */}
                                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                            إشعارات البريد الإلكتروني
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            تلقي ملخص يومي للمشاريع الجديدة والمقالات المنتظرة للمراجعة.
                                                        </p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer mr-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationPrefs.email_notifications}
                                                            onChange={(e) => {
                                                                const newValue = e.target.checked;
                                                                setNotificationPrefs(prev => ({
                                                                    ...prev,
                                                                    email_notifications: newValue
                                                                }));
                                                                handleNotificationPreferenceUpdate('email_notifications', newValue);
                                                            }}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Popup Notifications */}
                                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                            إشعارات النظام المنبثقة
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            تنبيهات فورية عند قيام طالب بتقديم مشروع جديد.
                                                        </p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer mr-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationPrefs.popup_notifications}
                                                            onChange={(e) => {
                                                                const newValue = e.target.checked;
                                                                setNotificationPrefs(prev => ({
                                                                    ...prev,
                                                                    popup_notifications: newValue
                                                                }));
                                                                handleNotificationPreferenceUpdate('popup_notifications', newValue);
                                                            }}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Platform Updates */}
                                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                            تحديثات المنصة
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            معرفة الميزات الجديدة والتحسينات المضافة لنظام إرث المبتكرين.
                                                        </p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer mr-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationPrefs.platform_updates}
                                                            onChange={(e) => {
                                                                const newValue = e.target.checked;
                                                                setNotificationPrefs(prev => ({
                                                                    ...prev,
                                                                    platform_updates: newValue
                                                                }));
                                                                handleNotificationPreferenceUpdate('platform_updates', newValue);
                                                            }}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Original profile design for other roles
    return (
        <DashboardLayout header="الملف الشخصي">
            <Head title="الملف الشخصي" />

            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold relative">
                                {getDisplayImage() ? (
                                    <>
                                        <img
                                            src={getDisplayImage()}
                                            alt={getDisplayName()}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const fallback = e.target.nextElementSibling;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                        <div className="hidden w-full h-full items-center justify-center">
                                            {getDisplayName()?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        {getDisplayName()?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    if (user.role === 'teacher') {
                                        teacherImageInputRef.current?.click();
                                    } else {
                                        imageInputRef.current?.click();
                                    }
                                }}
                                className="absolute bottom-0 right-0 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg transition"
                            >
                                <FaCamera className="text-sm" />
                            </button>
                            <input
                                ref={user.role === 'teacher' ? teacherImageInputRef : imageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={user.role === 'teacher' ? handleTeacherImageChange : handleImageChange}
                                className="hidden"
                            />
                        </div>

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {getDisplayName()}
                            </h1>
                            <p className="text-gray-600 mb-1">{user.email}</p>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {user.role === 'admin' && 'أدمن'}
                                    {user.role === 'teacher' && 'معلم'}
                                    {user.role === 'student' && 'طالب'}
                                </span>
                                {user.role === 'teacher' && teacher?.is_verified && (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                                        <FaCheckCircle className="text-xs" />
                                        معتمد
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'basic'
                                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FaUser className="inline ml-2" />
                            المعلومات الأساسية
                        </button>
                        {user.role === 'teacher' && (
                            <button
                                onClick={() => setActiveTab('teacher')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'teacher'
                                        ? 'border-b-2 border-yellow-500 text-yellow-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <FaGraduationCap className="inline ml-2" />
                                بيانات المعلم
                            </button>
                        )}
                        {user.role === 'student' && (
                            <button
                                onClick={() => setActiveTab('badges')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'badges'
                                        ? 'border-b-2 border-yellow-500 text-yellow-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <FaMedal className="inline ml-2" />
                                الشارات
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'password'
                                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FaLock className="inline ml-2" />
                            كلمة المرور
                        </button>
                        <button
                            onClick={() => setActiveTab('danger')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'danger'
                                    ? 'border-b-2 border-red-500 text-red-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FaTrash className="inline ml-2" />
                            حذف الحساب
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    {activeTab === 'basic' && (
                        <form onSubmit={handleBasicSubmit}>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaUser />
                                المعلومات الأساسية
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الاسم
                                    </label>
                                    <input
                                        type="text"
                                        value={basicForm.data.name}
                                        onChange={(e) => basicForm.setData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        required
                                    />
                                    {basicForm.errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{basicForm.errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        البريد الإلكتروني
                                    </label>
                                    <input
                                        type="email"
                                        value={basicForm.data.email}
                                        onChange={(e) => basicForm.setData('email', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        required
                                    />
                                    {basicForm.errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{basicForm.errors.email}</p>
                                    )}
                                    {mustVerifyEmail && user.email_verified_at === null && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            بريدك الإلكتروني غير مفعّل. يرجى التحقق من بريدك.
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={basicForm.processing}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
                                    >
                                        <FaSave />
                                        {basicForm.processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'teacher' && user.role === 'teacher' && teacher && (
                        <form onSubmit={handleTeacherSubmit}>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaGraduationCap />
                                بيانات المعلم
                            </h2>

                            <div className="space-y-6">
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الشخصية</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم بالعربية *</label>
                                            <input
                                                type="text"
                                                value={teacherForm.data.name_ar}
                                                onChange={(e) => teacherForm.setData('name_ar', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم بالإنجليزية *</label>
                                            <input
                                                type="text"
                                                value={teacherForm.data.name_en}
                                                onChange={(e) => teacherForm.setData('name_en', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الجنسية *</label>
                                            <select
                                                value={teacherForm.data.nationality}
                                                onChange={(e) => teacherForm.setData('nationality', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            >
                                                <option value="">اختر الجنسية</option>
                                                <option value="سعودي">سعودي</option>
                                                <option value="مصري">مصري</option>
                                                <option value="سوري">سوري</option>
                                                <option value="أردني">أردني</option>
                                                <option value="أخرى">أخرى</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الجنس *</label>
                                            <select
                                                value={teacherForm.data.gender}
                                                onChange={(e) => teacherForm.setData('gender', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            >
                                                <option value="">اختر الجنس</option>
                                                <option value="ذكر">ذكر</option>
                                                <option value="أنثى">أنثى</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات المهنية</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">السيرة الذاتية *</label>
                                            <textarea
                                                value={teacherForm.data.bio}
                                                onChange={(e) => teacherForm.setData('bio', e.target.value)}
                                                rows="4"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">المؤهلات *</label>
                                            <textarea
                                                value={teacherForm.data.qualifications}
                                                onChange={(e) => teacherForm.setData('qualifications', e.target.value)}
                                                rows="4"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">سنوات الخبرة *</label>
                                                <input
                                                    type="number"
                                                    value={teacherForm.data.experience_years}
                                                    onChange={(e) => teacherForm.setData('experience_years', e.target.value)}
                                                    min="0"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">السعر في الساعة (ريال) *</label>
                                                <input
                                                    type="number"
                                                    value={teacherForm.data.price_per_hour}
                                                    onChange={(e) => teacherForm.setData('price_per_hour', e.target.value)}
                                                    min="0"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {subjects && (
                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">المواد التي أدرسها *</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {subjects.map((subject) => (
                                                <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={teacherForm.data.subjects.includes(subject.name_ar)}
                                                        onChange={() => handleSubjectChange(subject.name_ar)}
                                                        className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                                    />
                                                    <span className="text-sm text-gray-700">{subject.name_ar}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">المراحل الدراسية *</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'].map((stage) => (
                                            <label key={stage} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={teacherForm.data.stages.includes(stage)}
                                                    onChange={() => handleStageChange(stage)}
                                                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                                />
                                                <span className="text-sm text-gray-700">{stage}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FaMapMarkerAlt />
                                        الموقع
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">المدينة *</label>
                                            <select
                                                value={teacherForm.data.city}
                                                onChange={(e) => teacherForm.setData('city', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            >
                                                <option value="">اختر المدينة</option>
                                                {cities?.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={teacherForm.processing}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
                                    >
                                        <FaSave />
                                        {teacherForm.processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'badges' && user.role === 'student' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaMedal />
                                الشارات المكتسبة
                            </h2>

                            {badges.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaMedal className="mx-auto text-6xl text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">لا توجد شارات مكتسبة بعد</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {badges.map((badge) => (
                                        <div
                                            key={badge.id}
                                            className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition"
                                        >
                                            <div className="text-center">
                                                <div className="text-6xl mb-4">
                                                    {badge.icon || '🏅'}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {badge.name_ar || badge.name}
                                                </h3>
                                                {badge.description_ar && (
                                                    <p className="text-gray-600 text-sm mb-3">
                                                        {badge.description_ar}
                                                    </p>
                                                )}
                                                {badge.earned_at && (
                                                    <p className="text-xs text-gray-500">
                                                        تم الحصول عليها: {badge.earned_at}
                                                    </p>
                                                )}
                                                {badge.reason && (
                                                    <p className="text-xs text-gray-600 mt-2 italic">
                                                        {badge.reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit}>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaLock />
                                تغيير كلمة المرور
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        كلمة المرور الحالية *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-yellow-400"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                        >
                                            {showCurrentPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                        </button>
                                    </div>
                                    {passwordForm.errors.current_password && (
                                        <p className="text-red-500 text-sm mt-1">{passwordForm.errors.current_password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        كلمة المرور الجديدة *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={passwordForm.data.password}
                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            className={`w-full border rounded-lg px-4 py-2 pr-12 focus:ring-2 ${
                                                passwordForm.data.password
                                                    ? passwordStrength.color === 'red'
                                                        ? 'border-red-300 focus:ring-red-400'
                                                        : passwordStrength.color === 'yellow'
                                                        ? 'border-yellow-300 focus:ring-yellow-400'
                                                        : 'border-green-300 focus:ring-green-400'
                                                    : 'border-gray-300 focus:ring-yellow-400'
                                            }`}
                                            required
                                            minLength="8"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                        >
                                            {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                        </button>
                                    </div>
                                    
                                    {/* Password Strength Indicator */}
                                    {passwordForm.data.password && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-600">قوة كلمة المرور:</span>
                                                <span className={`text-xs font-bold ${
                                                    passwordStrength.color === 'red' ? 'text-red-600' :
                                                    passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                        passwordStrength.color === 'red' ? 'bg-red-500' :
                                                        passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                                                        'bg-green-500'
                                                    }`}
                                                    style={{ width: `${passwordStrength.percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-600">
                                                <p className="mb-1">يجب أن تحتوي كلمة المرور على:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li className={passwordForm.data.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                                                        على الأقل 8 أحرف
                                                    </li>
                                                    <li className={/[a-z]/.test(passwordForm.data.password) ? 'text-green-600' : 'text-gray-500'}>
                                                        حرف صغير (a-z)
                                                    </li>
                                                    <li className={/[A-Z]/.test(passwordForm.data.password) ? 'text-green-600' : 'text-gray-500'}>
                                                        حرف كبير (A-Z)
                                                    </li>
                                                    <li className={/[0-9]/.test(passwordForm.data.password) ? 'text-green-600' : 'text-gray-500'}>
                                                        رقم (0-9)
                                                    </li>
                                                    <li className={/[^A-Za-z0-9]/.test(passwordForm.data.password) ? 'text-green-600' : 'text-gray-500'}>
                                                        رمز خاص (!@#$%^&*)
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {passwordForm.errors.password && (
                                        <p className="text-red-500 text-sm mt-1">{passwordForm.errors.password}</p>
                                    )}
                                    
                                    {passwordForm.data.password && !isPasswordStrong && (
                                        <p className="text-red-500 text-sm mt-2">
                                            ⚠️ كلمة المرور يجب أن تكون قوية لتتمكن من حفظها
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        تأكيد كلمة المرور *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswordConfirmation ? "text" : "password"}
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                            className={`w-full border rounded-lg px-4 py-2 pr-12 focus:ring-2 ${
                                                passwordForm.data.password_confirmation
                                                    ? passwordForm.data.password === passwordForm.data.password_confirmation
                                                        ? 'border-green-300 focus:ring-green-400'
                                                        : 'border-red-300 focus:ring-red-400'
                                                    : 'border-gray-300 focus:ring-yellow-400'
                                            }`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                        >
                                            {showPasswordConfirmation ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                        </button>
                                    </div>
                                    {passwordForm.data.password_confirmation && passwordForm.data.password !== passwordForm.data.password_confirmation && (
                                        <p className="text-red-500 text-sm mt-1">كلمة المرور غير متطابقة</p>
                                    )}
                                    {passwordForm.errors.password_confirmation && (
                                        <p className="text-red-500 text-sm mt-1">{passwordForm.errors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing || !isPasswordStrong || passwordForm.data.password !== passwordForm.data.password_confirmation}
                                        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition ${
                                            isPasswordStrong && passwordForm.data.password === passwordForm.data.password_confirmation
                                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <FaSave />
                                        {passwordForm.processing ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'danger' && (
                        <div>
                            <h2 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2">
                                <FaTrash />
                                حذف الحساب
                            </h2>

                            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg mb-6">
                                <p className="text-red-800 font-medium mb-2">تحذير!</p>
                                <p className="text-red-700 text-sm">
                                    عند حذف حسابك، سيتم حذف جميع بياناتك بشكل دائم ولن تتمكن من استرجاعها.
                                    يرجى التأكد قبل المتابعة.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
                            >
                                <FaTrash />
                                حذف الحساب
                            </button>

                            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                                <form onSubmit={handleDeleteAccount} className="p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                                        هل أنت متأكد من حذف حسابك؟
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        سيتم حذف جميع بياناتك بشكل دائم. يرجى إدخال كلمة المرور للتأكيد.
                                    </p>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            كلمة المرور *
                                        </label>
                                        <input
                                            type="password"
                                            value={deleteForm.data.password}
                                            onChange={(e) => deleteForm.setData('password', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400"
                                            required
                                            autoFocus
                                        />
                                        {deleteForm.errors.password && (
                                            <p className="text-red-500 text-sm mt-1">{deleteForm.errors.password}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
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
                            </Modal>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

