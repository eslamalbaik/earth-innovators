import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { useTranslation } from '@/i18n';
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
    const { t, language } = useTranslation();
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
        nationality: teacher?.nationality || 'إماراتي',
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
        education_type: teacher?.education_type || '',
        curriculum_type: teacher?.curriculum_type || [],
        teaching_language: teacher?.teaching_language || [],
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
                if (errors.image) {
                    alert(t('profilePage.alerts.imageUploadError', { message: errors.image }));
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
                let errorMessage = `${t('profilePage.alerts.saveDataErrorTitle')}\n`;
                if (errors.teacher_image) {
                    errorMessage += `${t('common.image')}: ${Array.isArray(errors.teacher_image) ? errors.teacher_image.join(', ') : errors.teacher_image}\n`;
                }
                if (errors.name) {
                    errorMessage += `${t('common.name')}: ${Array.isArray(errors.name) ? errors.name.join(', ') : errors.name}\n`;
                }
                if (errors.email) {
                    errorMessage += `${t('common.email')}: ${Array.isArray(errors.email) ? errors.email.join(', ') : errors.email}\n`;
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

    const handleCurriculumChange = (curriculum) => {
        const currentCurriculum = teacherForm.data.curriculum_type;
        if (currentCurriculum.includes(curriculum)) {
            teacherForm.setData('curriculum_type', currentCurriculum.filter(c => c !== curriculum));
        } else {
            teacherForm.setData('curriculum_type', [...currentCurriculum, curriculum]);
        }
    };

    const handleTeachingLanguageChange = (language) => {
        const currentLanguages = teacherForm.data.teaching_language;
        if (currentLanguages.includes(language)) {
            teacherForm.setData('teaching_language', currentLanguages.filter(l => l !== language));
        } else {
            teacherForm.setData('teaching_language', [...currentLanguages, language]);
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
        <DashboardLayout header={t('profilePage.title')}>
            <Head title={t('profilePage.pageTitle', { appName: t('common.appName') })} />

            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="max-w-5xl mx-auto">
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
                                className="absolute bottom-0 start-0 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg transition"
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
                                    {t(`roles.${user.role}`)}
                                </span>
                                {user.role === 'teacher' && teacher?.is_verified && (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                                        <FaCheckCircle className="text-xs" />
                                        {t('profilePage.verifiedTeacher')}
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
                            <FaUser className="inline me-2" />
                            {t('profilePage.tabs.basic')}
                        </button>
                        {user.role === 'teacher' && (
                            <button
                                onClick={() => setActiveTab('teacher')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'teacher'
                                        ? 'border-b-2 border-yellow-500 text-yellow-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <FaGraduationCap className="inline me-2" />
                                {t('profilePage.tabs.teacher')}
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
                                <FaMedal className="inline me-2" />
                                {t('profilePage.tabs.badges')}
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'password'
                                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FaLock className="inline me-2" />
                            {t('profilePage.tabs.password')}
                        </button>
                        <button
                            onClick={() => setActiveTab('danger')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'danger'
                                    ? 'border-b-2 border-red-500 text-red-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FaTrash className="inline me-2" />
                            {t('profilePage.tabs.danger')}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    {activeTab === 'basic' && (
                        <form onSubmit={handleBasicSubmit}>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaUser />
                                {t('profilePage.sections.basicInfo')}
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('common.name')}
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
                                        {t('common.email')}
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
                                            {t('profilePage.emailNotVerified')}
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
                                        {basicForm.processing ? t('profilePage.actions.saving') : t('profilePage.actions.saveChanges')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'teacher' && user.role === 'teacher' && teacher && (
                        <form onSubmit={handleTeacherSubmit}>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaGraduationCap />
                                {t('profilePage.sections.teacherInfo')}
                            </h2>

                            <div className="space-y-6">
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profilePage.teacher.sections.personalInfo')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.nameAr')} *</label>
                                            <input
                                                type="text"
                                                value={teacherForm.data.name_ar}
                                                onChange={(e) => teacherForm.setData('name_ar', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.nameEn')} *</label>
                                            <input
                                                type="text"
                                                value={teacherForm.data.name_en}
                                                onChange={(e) => teacherForm.setData('name_en', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.nationality')} *</label>
                                            <select
                                                value={teacherForm.data.nationality}
                                                onChange={(e) => teacherForm.setData('nationality', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            >
                                                <option value="">{t('profilePage.teacher.placeholders.selectNationality')}</option>
                                                <option value="إماراتي">{t('profilePage.teacher.nationalities.emirati')}</option>
                                                <option value="سعودي">{t('profilePage.teacher.nationalities.saudi')}</option>
                                                <option value="مصري">{t('profilePage.teacher.nationalities.egyptian')}</option>
                                                <option value="سوري">{t('profilePage.teacher.nationalities.syrian')}</option>
                                                <option value="أردني">{t('profilePage.teacher.nationalities.jordanian')}</option>
                                                <option value="لبناني">{t('profilePage.teacher.nationalities.lebanese')}</option>
                                                <option value="كويتي">{t('profilePage.teacher.nationalities.kuwaiti')}</option>
                                                <option value="قطري">{t('profilePage.teacher.nationalities.qatari')}</option>
                                                <option value="بحريني">{t('profilePage.teacher.nationalities.bahraini')}</option>
                                                <option value="عماني">{t('profilePage.teacher.nationalities.omani')}</option>
                                                <option value="أخرى">{t('common.other')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.gender')} *</label>
                                            <select
                                                value={teacherForm.data.gender}
                                                onChange={(e) => teacherForm.setData('gender', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            >
                                                <option value="">{t('profilePage.teacher.placeholders.selectGender')}</option>
                                                <option value="ذكر">{t('profilePage.gender.male')}</option>
                                                <option value="أنثى">{t('profilePage.gender.female')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profilePage.teacher.sections.professionalInfo')}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.bio')} *</label>
                                            <textarea
                                                value={teacherForm.data.bio}
                                                onChange={(e) => teacherForm.setData('bio', e.target.value)}
                                                rows="4"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.qualifications')} *</label>
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
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.experienceYears')} *</label>
                                                <input
                                                    type="number"
                                                    value={teacherForm.data.experience_years}
                                                    onChange={(e) => teacherForm.setData('experience_years', e.target.value)}
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
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profilePage.teacher.sections.subjects')} *</h3>
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profilePage.teacher.sections.stages')} *</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {[
                                            { value: 'رياض الأطفال', label: t('profilePage.teacher.stages.kindergarten') },
                                            { value: 'الابتدائية (الحلقة الأولى)', label: t('profilePage.teacher.stages.primaryCycle1') },
                                            { value: 'المتوسطة (الحلقة الثانية)', label: t('profilePage.teacher.stages.middleCycle2') },
                                            { value: 'الثانوية (الحلقة الثالثة)', label: t('profilePage.teacher.stages.highCycle3') },
                                            { value: 'المؤسسات التعليمية', label: t('profilePage.teacher.stages.educationalInstitutions') },
                                        ].map((stage) => (
                                            <label key={stage} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={teacherForm.data.stages.includes(stage.value)}
                                                    onChange={() => handleStageChange(stage.value)}
                                                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                                />
                                                <span className="text-sm text-gray-700">{stage.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profilePage.teacher.sections.additionalInfo')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.educationType')}</label>
                                            <select
                                                value={teacherForm.data.education_type}
                                                onChange={(e) => teacherForm.setData('education_type', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                            >
                                                <option value="">{t('profilePage.teacher.placeholders.selectEducationType')}</option>
                                                <option value="حكومي">{t('profilePage.teacher.educationTypes.public')}</option>
                                                <option value="خاص">{t('profilePage.teacher.educationTypes.private')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.pricePerHourAed')}</label>
                                            <input
                                                type="number"
                                                value={teacherForm.data.price_per_hour}
                                                onChange={(e) => teacherForm.setData('price_per_hour', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.curriculumType')}</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: 'بريطانية', label: t('profilePage.teacher.curricula.british') },
                                                { value: 'أمريكية', label: t('profilePage.teacher.curricula.american') },
                                                { value: 'IB', label: t('profilePage.teacher.curricula.ib') },
                                                { value: 'التربية والتعليم', label: t('profilePage.teacher.curricula.uaeMinistry') }
                                            ].map((curriculum) => (
                                                <label key={curriculum.value} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={teacherForm.data.curriculum_type.includes(curriculum.value)}
                                                        onChange={() => handleCurriculumChange(curriculum.value)}
                                                        className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                                    />
                                                    <span className="text-sm text-gray-700">{curriculum.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.teachingLanguage')}</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: 'عربية', label: t('profilePage.languages.arabic') },
                                                { value: 'إنجليزية', label: t('profilePage.languages.english') }
                                            ].map((language) => (
                                                <label key={language.value} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={teacherForm.data.teaching_language.includes(language.value)}
                                                        onChange={() => handleTeachingLanguageChange(language.value)}
                                                        className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                                    />
                                                    <span className="text-sm text-gray-700">{language.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FaMapMarkerAlt />
                                        {t('profilePage.teacher.sections.location')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePage.teacher.fields.city')} *</label>
                                            <select
                                                value={teacherForm.data.city}
                                                onChange={(e) => teacherForm.setData('city', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                                required
                                            >
                                                <option value="">{t('profilePage.teacher.placeholders.selectCity')}</option>
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
                                        {teacherForm.processing ? t('profilePage.actions.saving') : t('profilePage.actions.saveChanges')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'badges' && user.role === 'student' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaMedal />
                                {t('profilePage.sections.earnedBadges')}
                            </h2>

                            {badges.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaMedal className="mx-auto text-6xl text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">{t('profilePage.badges.empty')}</p>
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
                                                        {t('profilePage.badges.earnedAt', { date: badge.earned_at })}
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
                                {t('profilePage.sections.changePassword')}
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('profilePage.password.current')} *
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
                                        {t('profilePage.password.new')} *
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                        required
                                        minLength="8"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {language === 'ar'
                                            ? 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، مع حرف كبير وصغير ورقم ورمز خاص.'
                                            : 'Password must be at least 8 characters and include upper/lowercase letters, a number, and a symbol.'}
                                    </p>
                                    {passwordForm.errors.password && (
                                        <p className="text-red-500 text-sm mt-1">{passwordForm.errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('profilePage.password.confirm')} *
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
                                        {passwordForm.processing ? t('profilePage.actions.saving') : t('profilePage.actions.updatePassword')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'danger' && (
                        <div>
                            <h2 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2">
                                <FaTrash />
                                {t('profilePage.sections.deleteAccount')}
                            </h2>

                            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg mb-6">
                                <p className="text-red-800 font-medium mb-2">{t('profilePage.danger.warningTitle')}</p>
                                <p className="text-red-700 text-sm">
                                    {t('profilePage.danger.warningBody')}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
                            >
                                <FaTrash />
                                {t('profilePage.actions.deleteAccount')}
                            </button>

                            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                                <form onSubmit={handleDeleteAccount} className="p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                                        {t('profilePage.deleteModal.title')}
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        {t('profilePage.deleteModal.body')}
                                    </p>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('common.password')} *
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
                                            {t('common.cancel')}
                                        </button>
                                        <DangerButton
                                            type="submit"
                                            disabled={deleteForm.processing}
                                            className="flex-1"
                                        >
                                            {deleteForm.processing ? t('profilePage.actions.deleting') : t('profilePage.actions.confirmDeleteAccount')}
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
