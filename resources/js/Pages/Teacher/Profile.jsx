import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaSave, FaEdit, FaUpload, FaTimes } from 'react-icons/fa';
import { useState, useRef } from 'react';
import { getInitials, getColorFromName } from '@/utils/imageUtils';
import { useToast } from '@/Contexts/ToastContext';

const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
    }
    if (image.startsWith('/storage/')) {
        return image;
    }
    return `/storage/${image}`;
};

export default function Profile({ teacher, subjects, cities }) {
    const { showError } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, put, processing, errors, reset } = useForm({
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
        email: teacher?.email || teacher?.user?.email || '',
        phone: teacher?.phone || teacher?.user?.phone || '',
        contract_start_date: teacher?.contract_start_date || '',
        contract_end_date: teacher?.contract_end_date || '',
        contract_status: teacher?.contract_status || 'active',
        membership_type: teacher?.membership_type || 'standard',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showError('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }
            if (!file.type.startsWith('image/')) {
                showError('الملف المحدد ليس صورة');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name_ar', data.name_ar);
        formData.append('name_en', data.name_en);
        formData.append('nationality', data.nationality);
        formData.append('gender', data.gender);
        formData.append('bio', data.bio);
        formData.append('qualifications', data.qualifications);
        formData.append('experience_years', data.experience_years);
        formData.append('city', data.city);
        formData.append('price_per_hour', data.price_per_hour);
        formData.append('email', data.email);
        formData.append('phone', data.phone);

        if (Array.isArray(data.subjects)) {
            data.subjects.forEach((subject, index) => {
                formData.append(`subjects[${index}]`, subject);
            });
        }

        if (Array.isArray(data.stages)) {
            data.stages.forEach((stage, index) => {
                formData.append(`stages[${index}]`, stage);
            });
        }

        if (Array.isArray(data.neighborhoods)) {
            data.neighborhoods.forEach((neighborhood, index) => {
                formData.append(`neighborhoods[${index}]`, neighborhood);
            });
        }

        if (selectedImage) {
            formData.append('image', selectedImage);
        } else {
        }

        formData.append('_method', 'PUT');

        router.post('/teacher/profile', formData, {
            forceFormData: true,
            preserveScroll: false,
            onSuccess: (page) => {
                setIsEditing(false);
                setImagePreview(null);
                setSelectedImage(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setTimeout(() => {
                    router.reload({
                        only: ['teacher', 'auth'],
                        preserveScroll: false,
                    });
                }, 200);
            },
            onError: (errors) => {
                let errorMessage = 'حدث خطأ أثناء حفظ البيانات:\n';
                if (errors.image) {
                    errorMessage += 'الصورة: ' + (Array.isArray(errors.image) ? errors.image.join(', ') : errors.image) + '\n';
                }
                if (errors.name_ar) {
                    errorMessage += 'الاسم بالعربية: ' + (Array.isArray(errors.name_ar) ? errors.name_ar.join(', ') : errors.name_ar) + '\n';
                }
                if (errors.subjects) {
                    errorMessage += 'المواد: ' + (Array.isArray(errors.subjects) ? errors.subjects.join(', ') : errors.subjects) + '\n';
                }
                if (errors.stages) {
                    errorMessage += 'المراحل: ' + (Array.isArray(errors.stages) ? errors.stages.join(', ') : errors.stages) + '\n';
                }

                Object.keys(errors).forEach(key => {
                    if (!['image', 'name_ar', 'subjects', 'stages'].includes(key)) {
                        errorMessage += `${key}: ${Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key]}\n`;
                    }
                });

                showError(errorMessage, { autoDismiss: 6000 });
            },
        });
    };

    const handleSubjectChange = (subject) => {
        const currentSubjects = data.subjects;
        if (currentSubjects.includes(subject)) {
            setData('subjects', currentSubjects.filter(s => s !== subject));
        } else {
            setData('subjects', [...currentSubjects, subject]);
        }
    };

    const handleStageChange = (stage) => {
        const currentStages = data.stages;
        if (currentStages.includes(stage)) {
            setData('stages', currentStages.filter(s => s !== stage));
        } else {
            setData('stages', [...currentStages, stage]);
        }
    };

    const handleNeighborhoodChange = (neighborhood) => {
        const currentNeighborhoods = data.neighborhoods;
        if (currentNeighborhoods.includes(neighborhood)) {
            setData('neighborhoods', currentNeighborhoods.filter(n => n !== neighborhood));
        } else {
            setData('neighborhoods', [...currentNeighborhoods, neighborhood]);
        }
    };

    return (
        <DashboardLayout header="الملف الشخصي">
            <Head title="الملف الشخصي" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {imagePreview || getImageUrl(teacher?.image) ? (
                                    <img
                                        src={imagePreview || getImageUrl(teacher?.image)}
                                        alt={teacher?.name_ar}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400"
                                    />
                                ) : (
                                    <div
                                        className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-yellow-400"
                                        style={{
                                            background: `linear-gradient(135deg, ${getColorFromName(teacher?.name_ar).split(', ')[0]}, ${getColorFromName(teacher?.name_ar).split(', ')[1]})`,
                                        }}
                                    >
                                        {getInitials(teacher?.name_ar)}
                                    </div>
                                )}
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 shadow-lg transition"
                                        title="تغيير الصورة"
                                    >
                                        <FaUpload className="text-sm" />
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{teacher?.name_ar}</h1>
                                <p className="text-gray-600">{teacher?.name_en}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        {teacher?.is_verified ? 'معتمد' : 'غير معتمد'}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {teacher?.is_active ? 'نشط' : 'غير نشط'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(!isEditing);
                                    if (!isEditing) {
                                        setImagePreview(null);
                                        setSelectedImage(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                        reset();
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition"
                            >
                                <FaEdit />
                                {isEditing ? 'إلغاء التعديل' : 'تعديل الملف'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Membership Card */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🎓</span>
                                <h2 className="text-xl font-bold">بطاقة عضوية المعلم</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                    <div className="text-sm opacity-80">نوع العضوية</div>
                                    <div className="font-bold text-lg">{data.membership_type === 'premium' ? 'مميزة' : 'عادية'}</div>
                                </div>
                                <div>
                                    <div className="text-sm opacity-80">حالة العقد</div>
                                    <div className={`font-bold text-lg ${data.contract_status === 'active' ? 'text-green-300' : 'text-red-300'}`}>
                                        {data.contract_status === 'active' ? 'نشط' : 'غير نشط'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm opacity-80">تاريخ البداية</div>
                                    <div className="font-bold">{data.contract_start_date || 'غير محدد'}</div>
                                </div>
                                <div>
                                    <div className="text-sm opacity-80">تاريخ الانتهاء</div>
                                    <div className="font-bold">{data.contract_end_date || 'غير محدد'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-4xl">🏆</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FaUser />
                            المعلومات الشخصية
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم بالعربية *</label>
                                <input
                                    type="text"
                                    value={data.name_ar}
                                    onChange={(e) => setData('name_ar', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                    required
                                />
                                {errors.name_ar && <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم بالإنجليزية *</label>
                                <input
                                    type="text"
                                    value={data.name_en}
                                    onChange={(e) => setData('name_en', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                    required
                                />
                                {errors.name_en && <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الجنسية *</label>
                                <select
                                    value={data.nationality}
                                    onChange={(e) => setData('nationality', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                    required
                                >
                                    <option value="">اختر الجنسية</option>
                                    <option value="سعودي">سعودي</option>
                                    <option value="مصري">مصري</option>
                                    <option value="سوري">سوري</option>
                                    <option value="أردني">أردني</option>
                                    <option value="لبناني">لبناني</option>
                                    <option value="أخرى">أخرى</option>
                                </select>
                                {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الجنس *</label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                    required
                                >
                                    <option value="">اختر الجنس</option>
                                    <option value="ذكر">ذكر</option>
                                    <option value="أنثى">أنثى</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال *</label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                    required
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FaGraduationCap />
                            المعلومات المهنية
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">السيرة الذاتية *</label>
                                <textarea
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    disabled={!isEditing}
                                    rows="4"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                    placeholder="اكتب سيرتك الذاتية..."
                                    required
                                />
                                {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">المؤهلات والخبرات *</label>
                                <textarea
                                    value={data.qualifications}
                                    onChange={(e) => setData('qualifications', e.target.value)}
                                    disabled={!isEditing}
                                    rows="4"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                    placeholder="اكتب مؤهلاتك وخبراتك..."
                                    required
                                />
                                {errors.qualifications && <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">سنوات الخبرة *</label>
                                    <input
                                        type="number"
                                        value={data.experience_years}
                                        onChange={(e) => setData('experience_years', e.target.value)}
                                        disabled={!isEditing}
                                        min="0"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                        required
                                    />
                                    {errors.experience_years && <p className="text-red-500 text-sm mt-1">{errors.experience_years}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">السعر في الساعة (ريال) *</label>
                                    <input
                                        type="number"
                                        value={data.price_per_hour}
                                        onChange={(e) => setData('price_per_hour', e.target.value)}
                                        disabled={!isEditing}
                                        min="0"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                        required
                                    />
                                    {errors.price_per_hour && <p className="text-red-500 text-sm mt-1">{errors.price_per_hour}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">المواد التي أدرسها *</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {subjects?.map((subject) => (
                                <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.subjects.includes(subject.name_ar)}
                                        onChange={() => handleSubjectChange(subject.name_ar)}
                                        disabled={!isEditing}
                                        className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400 disabled:opacity-50"
                                    />
                                    <span className="text-sm text-gray-700">{subject.name_ar}</span>
                                </label>
                            ))}
                        </div>
                        {errors.subjects && <p className="text-red-500 text-sm mt-2">{errors.subjects}</p>}
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">المراحل الدراسية *</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'].map((stage) => (
                                <label key={stage} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.stages.includes(stage)}
                                        onChange={() => handleStageChange(stage)}
                                        disabled={!isEditing}
                                        className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400 disabled:opacity-50"
                                    />
                                    <span className="text-sm text-gray-700">{stage}</span>
                                </label>
                            ))}
                        </div>
                        {errors.stages && <p className="text-red-500 text-sm mt-2">{errors.stages}</p>}
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FaMapMarkerAlt />
                            الموقع
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">المدينة *</label>
                                <select
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                                    required
                                >
                                    <option value="">اختر المدينة</option>
                                    {cities?.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الأحياء</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الطائف'].map((neighborhood) => (
                                        <label key={neighborhood} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.neighborhoods.includes(neighborhood)}
                                                onChange={() => handleNeighborhoodChange(neighborhood)}
                                                disabled={!isEditing}
                                                className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400 disabled:opacity-50"
                                            />
                                            <span className="text-sm text-gray-700">{neighborhood}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.neighborhoods && <p className="text-red-500 text-sm mt-2">{errors.neighborhoods}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Contract & Membership Section */}
                    {isEditing && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUser />
                                معلومات العقد والعضوية
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع العضوية</label>
                                    <select
                                        value={data.membership_type}
                                        onChange={(e) => setData('membership_type', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    >
                                        <option value="standard">عادية</option>
                                        <option value="premium">مميزة</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">حالة العقد</label>
                                    <select
                                        value={data.contract_status}
                                        onChange={(e) => setData('contract_status', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    >
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                        <option value="expired">منتهي</option>
                                        <option value="pending">قيد الانتظار</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ بداية العقد</label>
                                    <input
                                        type="date"
                                        value={data.contract_start_date}
                                        onChange={(e) => setData('contract_start_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ نهاية العقد</label>
                                    <input
                                        type="date"
                                        value={data.contract_end_date}
                                        onChange={(e) => setData('contract_end_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {isEditing && (
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition disabled:opacity-50"
                            >
                                <FaSave />
                                {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </DashboardLayout>
    );
}
