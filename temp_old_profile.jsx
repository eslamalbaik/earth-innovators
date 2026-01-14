import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
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
} from 'react-icons/fa';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';

export default function Profile({ auth, mustVerifyEmail, status, teacher, subjects, cities, badges = [] }) {
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('basic');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [teacherImagePreview, setTeacherImagePreview] = useState(null);
    const imageInputRef = useRef(null);
    const teacherImageInputRef = useRef(null);

    const basicForm = useForm({
        name: user.name || '',
        email: user.email || '',
        image: null,
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
                    alert('╪«╪╖╪ث ┘┘è ╪▒┘╪╣ ╪د┘╪╡┘ê╪▒╪ر: ' + errors.image);
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
                let errorMessage = '╪ص╪»╪س ╪«╪╖╪ث ╪ث╪س┘╪د╪ة ╪ص┘╪╕ ╪د┘╪ذ┘è╪د┘╪د╪ز:\n';
                if (errors.teacher_image) {
                    errorMessage += '╪د┘╪╡┘ê╪▒╪ر: ' + (Array.isArray(errors.teacher_image) ? errors.teacher_image.join(', ') : errors.teacher_image) + '\n';
                }
                if (errors.name) {
                    errorMessage += '╪د┘╪د╪│┘à: ' + (Array.isArray(errors.name) ? errors.name.join(', ') : errors.name) + '\n';
                }
                if (errors.email) {
                    errorMessage += '╪د┘╪ذ╪▒┘è╪» ╪د┘╪ح┘┘â╪ز╪▒┘ê┘┘è: ' + (Array.isArray(errors.email) ? errors.email.join(', ') : errors.email) + '\n';
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

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.post(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        deleteForm.delete(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
            },
        });
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

    return (
        <DashboardLayout header="╪د┘┘à┘┘ ╪د┘╪┤╪«╪╡┘è">
            <Head title="╪د┘┘à┘┘ ╪د┘╪┤╪«╪╡┘è" />

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
                                    {user.role === 'admin' && '╪ث╪»┘à┘'}
                                    {user.role === 'teacher' && '┘à╪╣┘┘à'}
                                    {user.role === 'student' && '╪╖╪د┘╪ذ'}
                                </span>
                                {user.role === 'teacher' && teacher?.is_verified && (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                                        <FaCheckCircle className="text-xs" />
                                        ┘à╪╣╪ز┘à╪»
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
                            ╪د┘┘à╪╣┘┘ê┘à╪د╪ز ╪د┘╪ث╪│╪د╪│┘è╪ر
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
                                ╪ذ┘è╪د┘╪د╪ز ╪د┘┘à╪╣┘┘à
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
                                ╪د┘╪┤╪د╪▒╪د╪ز
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
                            ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒
                        </button>
                        <button
                            onClick={() => setActiveTab('danger')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'danger'
                                    ? 'border-b-2 border-red-500 text-red-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FaTrash className="inline ml-2" />
                            ╪ص╪░┘ ╪د┘╪ص╪│╪د╪ذ
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    {activeTab === 'basic' && (
                        <form onSubmit={handleBasicSubmit}>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaUser />
                                ╪د┘┘à╪╣┘┘ê┘à╪د╪ز ╪د┘╪ث╪│╪د╪│┘è╪ر
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ╪د┘╪د╪│┘à
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
                                        ╪د┘╪ذ╪▒┘è╪» ╪د┘╪ح┘┘â╪ز╪▒┘ê┘┘è
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
                                            ╪ذ╪▒┘è╪»┘â ╪د┘╪ح┘┘â╪ز╪▒┘ê┘┘è ╪║┘è╪▒ ┘à┘╪╣┘ّ┘. ┘è╪▒╪ش┘ë ╪د┘╪ز╪ص┘é┘é ┘à┘ ╪ذ╪▒┘è╪»┘â.
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
                                        {basicForm.processing ? '╪ش╪د╪▒┘è ╪د┘╪ص┘╪╕...' : '╪ص┘╪╕ ╪د┘╪ز╪║┘è┘è╪▒╪د╪ز'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'teacher' && user.role === 'teacher' && teacher && (
                        <form onSubmit={handleTeacherSubmit}>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaGraduationCap />
                                ╪ذ┘è╪د┘╪د╪ز ╪د┘┘à╪╣┘┘à
                            </h2>

                            <div className="space-y-6">
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">╪د┘┘à╪╣┘┘ê┘à╪د╪ز ╪د┘╪┤╪«╪╡┘è╪ر</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">╪د┘╪د╪│┘à ╪ذ╪د┘╪╣╪▒╪ذ┘è╪ر *</label>
                                            <input
                                                type="text"
                                                value={teacherForm.data.name_ar}
                                                onChange={(e) => teacherForm.setData('name_ar', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">╪د┘╪د╪│┘à ╪ذ╪د┘╪ح┘╪ش┘┘è╪▓┘è╪ر *</label>
                                            <input
                                                type="text"
                                                value={teacherForm.data.name_en}
                                                onChange={(e) => teacherForm.setData('name_en', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">╪د┘╪ش┘╪│┘è╪ر *</label>
                                            <select
                                                value={teacherForm.data.nationality}
                                                onChange={(e) => teacherForm.setData('nationality', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            >
                                                <option value="">╪د╪«╪ز╪▒ ╪د┘╪ش┘╪│┘è╪ر</option>
                                                <option value="╪│╪╣┘ê╪»┘è">╪│╪╣┘ê╪»┘è</option>
                                                <option value="┘à╪╡╪▒┘è">┘à╪╡╪▒┘è</option>
                                                <option value="╪│┘ê╪▒┘è">╪│┘ê╪▒┘è</option>
                                                <option value="╪ث╪▒╪»┘┘è">╪ث╪▒╪»┘┘è</option>
                                                <option value="╪ث╪«╪▒┘ë">╪ث╪«╪▒┘ë</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">╪د┘╪ش┘╪│ *</label>
                                            <select
                                                value={teacherForm.data.gender}
                                                onChange={(e) => teacherForm.setData('gender', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            >
                                                <option value="">╪د╪«╪ز╪▒ ╪د┘╪ش┘╪│</option>
                                                <option value="╪░┘â╪▒">╪░┘â╪▒</option>
                                                <option value="╪ث┘╪س┘ë">╪ث┘╪س┘ë</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">╪د┘┘à╪╣┘┘ê┘à╪د╪ز ╪د┘┘à┘ç┘┘è╪ر</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">╪د┘╪│┘è╪▒╪ر ╪د┘╪░╪د╪ز┘è╪ر *</label>
                                            <textarea
                                                value={teacherForm.data.bio}
                                                onChange={(e) => teacherForm.setData('bio', e.target.value)}
                                                rows="4"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">╪د┘┘à╪ج┘ç┘╪د╪ز *</label>
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
                                                <label className="block text-sm font-medium text-gray-700 mb-2">╪│┘┘ê╪د╪ز ╪د┘╪«╪ذ╪▒╪ر *</label>
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
                                                <label className="block text-sm font-medium text-gray-700 mb-2">╪د┘╪│╪╣╪▒ ┘┘è ╪د┘╪│╪د╪╣╪ر (╪▒┘è╪د┘) *</label>
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
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">╪د┘┘à┘ê╪د╪» ╪د┘╪ز┘è ╪ث╪»╪▒╪│┘ç╪د *</h3>
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">╪د┘┘à╪▒╪د╪ص┘ ╪د┘╪»╪▒╪د╪│┘è╪ر *</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {['╪د┘╪د╪ذ╪ز╪»╪د╪خ┘è╪ر', '╪د┘┘à╪ز┘ê╪│╪╖╪ر', '╪د┘╪س╪د┘┘ê┘è╪ر', '╪د┘╪ش╪د┘à╪╣┘è╪ر'].map((stage) => (
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
                                        ╪د┘┘à┘ê┘é╪╣
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">╪د┘┘à╪»┘è┘╪ر *</label>
                                            <select
                                                value={teacherForm.data.city}
                                                onChange={(e) => teacherForm.setData('city', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            >
                                                <option value="">╪د╪«╪ز╪▒ ╪د┘┘à╪»┘è┘╪ر</option>
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
                                        {teacherForm.processing ? '╪ش╪د╪▒┘è ╪د┘╪ص┘╪╕...' : '╪ص┘╪╕ ╪د┘╪ز╪║┘è┘è╪▒╪د╪ز'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'badges' && user.role === 'student' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaMedal />
                                ╪د┘╪┤╪د╪▒╪د╪ز ╪د┘┘à┘â╪ز╪│╪ذ╪ر
                            </h2>

                            {badges.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaMedal className="mx-auto text-6xl text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">┘╪د ╪ز┘ê╪ش╪» ╪┤╪د╪▒╪د╪ز ┘à┘â╪ز╪│╪ذ╪ر ╪ذ╪╣╪»</p>
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
                                                    {badge.icon || '≡اà'}
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
                                                        ╪ز┘à ╪د┘╪ص╪╡┘ê┘ ╪╣┘┘è┘ç╪د: {badge.earned_at}
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
                                ╪ز╪║┘è┘è╪▒ ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ ╪د┘╪ص╪د┘┘è╪ر *
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                        required
                                    />
                                    {passwordForm.errors.current_password && (
                                        <p className="text-red-500 text-sm mt-1">{passwordForm.errors.current_password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ ╪د┘╪ش╪»┘è╪»╪ر *
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                        required
                                        minLength="8"
                                    />
                                    {passwordForm.errors.password && (
                                        <p className="text-red-500 text-sm mt-1">{passwordForm.errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ╪ز╪ث┘â┘è╪» ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ *
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                        required
                                    />
                                    {passwordForm.errors.password_confirmation && (
                                        <p className="text-red-500 text-sm mt-1">{passwordForm.errors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
                                    >
                                        <FaSave />
                                        {passwordForm.processing ? '╪ش╪د╪▒┘è ╪د┘╪ص┘╪╕...' : '╪ز╪ص╪»┘è╪س ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'danger' && (
                        <div>
                            <h2 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2">
                                <FaTrash />
                                ╪ص╪░┘ ╪د┘╪ص╪│╪د╪ذ
                            </h2>

                            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg mb-6">
                                <p className="text-red-800 font-medium mb-2">╪ز╪ص╪░┘è╪▒!</p>
                                <p className="text-red-700 text-sm">
                                    ╪╣┘╪» ╪ص╪░┘ ╪ص╪│╪د╪ذ┘â╪î ╪│┘è╪ز┘à ╪ص╪░┘ ╪ش┘à┘è╪╣ ╪ذ┘è╪د┘╪د╪ز┘â ╪ذ╪┤┘â┘ ╪»╪د╪خ┘à ┘ê┘┘ ╪ز╪ز┘à┘â┘ ┘à┘ ╪د╪│╪ز╪▒╪ش╪د╪╣┘ç╪د.
                                    ┘è╪▒╪ش┘ë ╪د┘╪ز╪ث┘â╪» ┘é╪ذ┘ ╪د┘┘à╪ز╪د╪ذ╪╣╪ر.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
                            >
                                <FaTrash />
                                ╪ص╪░┘ ╪د┘╪ص╪│╪د╪ذ
                            </button>

                            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                                <form onSubmit={handleDeleteAccount} className="p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                                        ┘ç┘ ╪ث┘╪ز ┘à╪ز╪ث┘â╪» ┘à┘ ╪ص╪░┘ ╪ص╪│╪د╪ذ┘â╪ا
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        ╪│┘è╪ز┘à ╪ص╪░┘ ╪ش┘à┘è╪╣ ╪ذ┘è╪د┘╪د╪ز┘â ╪ذ╪┤┘â┘ ╪»╪د╪خ┘à. ┘è╪▒╪ش┘ë ╪ح╪»╪«╪د┘ ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ ┘┘╪ز╪ث┘â┘è╪».
                                    </p>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ *
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
                                            ╪ح┘╪║╪د╪ة
                                        </button>
                                        <DangerButton
                                            type="submit"
                                            disabled={deleteForm.processing}
                                            className="flex-1"
                                        >
                                            {deleteForm.processing ? '╪ش╪د╪▒┘è ╪د┘╪ص╪░┘...' : '╪ص╪░┘ ╪د┘╪ص╪│╪د╪ذ'}
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

