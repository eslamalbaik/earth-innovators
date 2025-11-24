import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { FaSave, FaArrowRight, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaDollarSign, FaImage } from 'react-icons/fa';
import { useMemo, useState } from 'react';

const parseJsonArray = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.warn('Failed to parse JSON array', value, error);
            }
        }

        return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
    }

    if (typeof value === 'object') {
        return Object.values(value).filter(Boolean);
    }

    return [];
};

const DEFAULT_DIAL_CODE = '+966';

const dialCodeOptions = [
    { value: '+966', label: '+966' },
    { value: '+971', label: '+971' },
    { value: '+973', label: '+973' },
    { value: '+974', label: '+974' },
    { value: '+965', label: '+965' },
    { value: '+968', label: '+968' },
    { value: '+964', label: '+964' },
    { value: '+967', label: '+967' },
];

const detectDialCode = (phone) => {
    if (typeof phone !== 'string') {
        return DEFAULT_DIAL_CODE;
    }

    const trimmed = phone.trim();
    if (!trimmed) {
        return DEFAULT_DIAL_CODE;
    }

    const matchedOption = dialCodeOptions.find((option) => trimmed.startsWith(option.value));
    if (matchedOption) {
        return matchedOption.value;
    }

    const plusNumberMatch = trimmed.match(/^\+\d{1,4}/);
    if (plusNumberMatch) {
        return plusNumberMatch[0];
    }

    return DEFAULT_DIAL_CODE;
};

const stripDialCode = (phone, dialCode) => {
    if (typeof phone !== 'string') {
        return '';
    }

    const normalizedDialCode = dialCode || DEFAULT_DIAL_CODE;
    if (phone.startsWith(normalizedDialCode)) {
        return phone.slice(normalizedDialCode.length).trim().replace(/\D/g, '');
    }

    return phone.replace(/\D/g, '');
};

export default function EditTeacher({ teacher, subjects, cities, auth }) {
    const [selectedImage, setSelectedImage] = useState(null);

    const initialRawPhone = teacher.user?.phone || teacher.phone || '';

    const { initialDialCode, initialLocalPhone } = useMemo(() => {
        const dialCode = detectDialCode(initialRawPhone);
        const localPhone = stripDialCode(initialRawPhone, dialCode);

        return {
            initialDialCode: dialCode,
            initialLocalPhone: localPhone,
        };
    }, [initialRawPhone]);

    const subjectOptions = useMemo(
        () =>
            subjects.map((subject) => ({
                id: subject.id,
                label: subject.name_ar || subject.name_en || subject.name || subject.title || '',
            })),
        [subjects]
    );

    const pivotSubjects = useMemo(() => {
        const relation = teacher.subjectsRelation ?? teacher.subjects_relation ?? [];

        if (Array.isArray(relation)) {
            return relation;
        }

        if (relation && typeof relation === 'object') {
            return Object.values(relation).filter(Boolean);
        }

        return [];
    }, [teacher.subjectsRelation, teacher.subjects_relation]);

    const initialSubjectIds = useMemo(() => {
        const rawSubjects = parseJsonArray(teacher.subjects);

        const fromRaw = rawSubjects
            .map((item) => {
                if (typeof item === 'number') {
                    return item;
                }
                if (typeof item === 'string') {
                    const match = subjectOptions.find((subject) => subject.label === item);
                    return match ? match.id : null;
                }
                if (item && typeof item === 'object') {
                    const candidate =
                        item.id ??
                        item.subject_id ??
                        item.pivot?.subject_id ??
                        (typeof item.label === 'string'
                            ? subjectOptions.find((subject) => subject.label === item.label)?.id
                            : null);
                    return candidate ?? null;
                }
                return null;
            })
            .filter((id) => id !== null);

        const fromPivot = pivotSubjects
            .map((item) => item?.id ?? item?.subject_id ?? item?.pivot?.subject_id ?? null)
            .filter((id) => id !== null)
            .map((id) => Number(id))
            .filter((id) => !Number.isNaN(id));

        return Array.from(new Set([...fromRaw, ...fromPivot]));
    }, [teacher.subjects, subjectOptions, pivotSubjects]);

    const initialStages = useMemo(() => {
        const parsed = parseJsonArray(teacher.stages);

        return parsed
            .map((item) => {
                if (typeof item === 'string') {
                    return item;
                }
                if (item && typeof item === 'object') {
                    return item.name ?? item.label ?? item.title ?? '';
                }
                return '';
            })
            .filter((stage) => stage && typeof stage === 'string');
    }, [teacher.stages]);

    const stageOptions = useMemo(() => {
        const defaults = ['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية', 'رياض الأطفال'];
        return Array.from(new Set([...defaults, ...initialStages]));
    }, [initialStages]);

    const { data, setData, transform, post, processing, errors } = useForm({
        name_ar: teacher.name_ar || '',
        name_en: teacher.name_en || '',
        email: teacher.user?.email || '',
        phone: initialLocalPhone,
        dial_code: initialDialCode,
        city: teacher.city || '',
        bio: teacher.bio || '',
        nationality: teacher.nationality || 'سعودي',
        gender: teacher.gender || '',
        qualifications: teacher.qualifications || '',
        price_per_hour: teacher.price_per_hour || 0,
        subjects: initialSubjectIds,
        stages: initialStages,
        is_verified: teacher.is_verified || false,
        is_active: teacher.is_active || false,
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        transform((currentData) => {
            const normalizedSubjects = Array.isArray(currentData.subjects)
                ? currentData.subjects.map((subjectId) => Number(subjectId)).filter((id) => !Number.isNaN(id))
                : [];

            const normalizedStages = Array.isArray(currentData.stages)
                ? currentData.stages.filter(Boolean)
                : [];

            const normalizedDialCode = currentData.dial_code || DEFAULT_DIAL_CODE;
            const cleanedPhone = String(currentData.phone || '').replace(/\D/g, '');
            const { dial_code, ...rest } = currentData;

            return {
                ...rest,
                subjects: normalizedSubjects,
                stages: normalizedStages,
                phone: `${normalizedDialCode}${cleanedPhone}`,
                is_verified: currentData.is_verified ? 1 : 0,
                is_active: currentData.is_active ? 1 : 0,
                _method: 'PUT',
            };
        });

        post(`/admin/teachers/${teacher.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            setData('image', file);
        }
    };

    const handleDialCodeChange = (e) => {
        setData('dial_code', e.target.value);
    };

    const handlePhoneInputChange = (e) => {
        const sanitized = e.target.value.replace(/\D/g, '');
        setData('phone', sanitized);
    };

    const handleSubjectChange = (subjectId) => {
        const normalizedId = Number(subjectId);
        const newSubjects = data.subjects.includes(normalizedId)
            ? data.subjects.filter((id) => id !== normalizedId)
            : [...data.subjects, normalizedId];
        setData('subjects', newSubjects);
    };

    const handleStageChange = (stage) => {
        const normalizedStage = stage;
        const newStages = data.stages.includes(normalizedStage)
            ? data.stages.filter((s) => s !== normalizedStage)
            : [...data.stages, normalizedStage];
        setData('stages', newStages);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="تعديل المعلم" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <button
                                    onClick={() => window.history.back()}
                                    className="flex items-center text-gray-600 hover:text-gray-900 transition duration-300"
                                >
                                    <FaArrowRight className="ml-2" />
                                    العودة
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">تعديل المعلم</h1>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1">
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                                                {selectedImage ? (
                                                    <img
                                                        src={selectedImage}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : teacher.image ? (
                                                    <img
                                                        src={teacher.image}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FaUser className="text-gray-400 text-4xl" />
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 bg-yellow-500 text-white p-2 rounded-full cursor-pointer hover:bg-yellow-600 transition duration-300">
                                                <FaImage />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-sm text-gray-600">الصورة الشخصية</p>
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaUser className="inline ml-2" />
                                                الاسم بالعربية *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name_ar}
                                                onChange={(e) => setData('name_ar', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder="محمد العتيبي"
                                                required
                                            />
                                            {errors.name_ar && <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaUser className="inline ml-2" />
                                                الاسم بالإنجليزية
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name_en}
                                                onChange={(e) => setData('name_en', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder="Mohammed Al-Otaibi"
                                            />
                                            {errors.name_en && <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaEnvelope className="inline ml-2" />
                                                البريد الإلكتروني *
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder="mohammed@example.com"
                                                required
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaPhone className="inline ml-2" />
                                                رقم الجوال *
                                            </label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={data.dial_code}
                                                    onChange={handleDialCodeChange}
                                                    className="w-1/5 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50 text-sm"
                                                    required
                                                >
                                                    {dialCodeOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={handlePhoneInputChange}
                                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    placeholder="512345678"
                                                    autoComplete="tel"
                                                    required
                                                />
                                            </div>
                                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaMapMarkerAlt className="inline ml-2" />
                                                المدينة *
                                            </label>
                                            <select
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">اختر المدينة</option>
                                                {cities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaGraduationCap className="inline ml-2" />
                                                الجنسية
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nationality}
                                                onChange={(e) => setData('nationality', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder="سعودي"
                                            />
                                            {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                الجنس
                                            </label>
                                            <select
                                                value={data.gender}
                                                onChange={(e) => setData('gender', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            >
                                                <option value="">اختر الجنس</option>
                                                <option value="ذكر">ذكر</option>
                                                <option value="أنثى">أنثى</option>
                                            </select>
                                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaDollarSign className="inline ml-2" />
                                                سعر الحصة (ساعة) *
                                            </label>
                                            <input
                                                type="number"
                                                value={data.price_per_hour}
                                                onChange={(e) => setData('price_per_hour', parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder="20"
                                                required
                                            />
                                            {errors.price_per_hour && <p className="text-red-500 text-sm mt-1">{errors.price_per_hour}</p>}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            نبذة شخصية
                                        </label>
                                        <textarea
                                            value={data.bio}
                                            onChange={(e) => setData('bio', e.target.value)}
                                            rows="4"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            placeholder="اكتب نبذة مختصرة عن نفسك وخبراتك..."
                                        />
                                        {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            المؤهلات
                                        </label>
                                        <textarea
                                            value={data.qualifications}
                                            onChange={(e) => setData('qualifications', e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            placeholder="اكتب مؤهلاتك الأكاديمية..."
                                        />
                                        {errors.qualifications && <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>}
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            المواد التي يدرسها *
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {subjectOptions.map((subject) => (
                                                <label key={subject.id} className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition duration-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.subjects.includes(subject.id)}
                                                        onChange={() => handleSubjectChange(subject.id)}
                                                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                                    />
                                                    <span className="mr-3 text-sm font-medium text-gray-700">{subject.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            المراحل الدراسية *
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {stageOptions.map(stage => (
                                                <label key={stage} className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition duration-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.stages.includes(stage)}
                                                        onChange={() => handleStageChange(stage)}
                                                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                                    />
                                                    <span className="mr-3 text-sm font-medium text-gray-700">{stage}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.stages && <p className="text-red-500 text-sm mt-1">{errors.stages}</p>}
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-center space-x-6 space-x-reverse">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_verified}
                                                    onChange={(e) => setData('is_verified', e.target.checked)}
                                                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                                />
                                                <span className="mr-2 text-sm font-medium text-gray-700">معلم موثق</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_active}
                                                    onChange={(e) => setData('is_active', e.target.checked)}
                                                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                                />
                                                <span className="mr-2 text-sm font-medium text-gray-700">نشط</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end space-x-4 space-x-reverse">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-300"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition duration-300 flex items-center"
                                >
                                    <FaSave className="ml-2" />
                                    {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
