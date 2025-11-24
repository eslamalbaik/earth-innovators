import { useState } from 'react';
import { FaPlus, FaTrash, FaEye, FaEyeSlash, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { router } from '@inertiajs/react';

const DEFAULT_DIAL_CODE = '+966';

const dialCodeOptions = [
    // الدول الخليجية
    { value: '+966', label: '+966 (السعودية)' },
    // { value: '+971', label: '+971 (الإمارات)' },
    // { value: '+973', label: '+973 (البحرين)' },
    // { value: '+974', label: '+974 (قطر)' },
    // { value: '+965', label: '+965 (الكويت)' },
    // { value: '+968', label: '+968 (عمان)' },
    // // بلاد الشام
    // { value: '+970', label: '+970 (فلسطين)' },
    // { value: '+963', label: '+963 (سوريا)' },
    // { value: '+964', label: '+964 (العراق)' },
    // { value: '+967', label: '+967 (اليمن)' },
    // // مصر والأردن
    // { value: '+20', label: '+20 (مصر)' },
    // { value: '+962', label: '+962 (الأردن)' },
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

export default function JoinTeacherForm({ subjects = [], cities = [] }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dial_code: DEFAULT_DIAL_CODE,
        city: '',
        password: '',
        password_confirmation: '',
        bio: '',
        profile_image: null,
        subjects: [],
        stages: [],
        price_per_hour: 0,
        certifications: [],
        experiences: [],
    });

    const [certifications, setCertifications] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [newCertification, setNewCertification] = useState({ name: '', issuer: '' });
    const [newExperience, setNewExperience] = useState({
        title: '',
        employer: '',
        startDate: '',
        endDate: '',
        stillWorking: false,
        description: ''
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0] || null
            }));
        } else if (type === 'checkbox') {
            if (name === 'stages') {
                const updatedStages = checked
                    ? [...formData.stages, value]
                    : formData.stages.filter(stage => stage !== value);
                setFormData(prev => ({ ...prev, stages: updatedStages }));
            } else if (name === 'subjects') {
                const subjectId = parseInt(value);
                const updatedSubjects = checked
                    ? [...formData.subjects, subjectId]
                    : formData.subjects.filter(id => id !== subjectId);
                setFormData(prev => ({ ...prev, subjects: updatedSubjects }));
            }
        } else {
            if (name === 'price_per_hour') {
                setFormData(prev => ({
                    ...prev,
                    [name]: parseFloat(value) || 0
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        }
    };

    const handlePhoneChange = (e) => {
        const sanitized = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, phone: sanitized }));
    };

    const handleDialCodeChange = (e) => {
        setFormData(prev => ({ ...prev, dial_code: e.target.value }));
    };

    const addCertification = () => {
        if (newCertification.name && newCertification.issuer) {
            const cert = { id: Date.now(), ...newCertification };
            setCertifications([...certifications, cert]);
            setFormData(prev => ({
                ...prev,
                certifications: [...prev.certifications, cert]
            }));
            setNewCertification({ name: '', issuer: '' });
        }
    };

    const removeCertification = (id) => {
        setCertifications(certifications.filter(cert => cert.id !== id));
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter(cert => cert.id !== id)
        }));
    };

    const addExperience = () => {
        if (newExperience.title && newExperience.employer && newExperience.startDate) {
            const exp = {
                id: Date.now(),
                title: newExperience.title,
                employer: newExperience.employer,
                start_date: newExperience.startDate,
                end_date: newExperience.endDate,
                still_working: newExperience.stillWorking,
                description: newExperience.description
            };
            setExperiences([...experiences, exp]);
            setFormData(prev => ({
                ...prev,
                experiences: [...prev.experiences, exp]
            }));
            setNewExperience({
                title: '',
                employer: '',
                startDate: '',
                endDate: '',
                stillWorking: false,
                description: ''
            });
        }
    };

    const removeExperience = (id) => {
        setExperiences(experiences.filter(exp => exp.id !== id));
        setFormData(prev => ({
            ...prev,
            experiences: prev.experiences.filter(exp => exp.id !== id)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.password) {
            setError('يرجى ملء جميع الحقول المطلوبة');
            setLoading(false);
            return;
        }

        if (formData.subjects.length === 0) {
            setError('يرجى اختيار مادة واحدة على الأقل');
            setLoading(false);
            return;
        }

        if (formData.stages.length === 0) {
            setError('يرجى اختيار مرحلة دراسية واحدة على الأقل');
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();

            // دمج رقم الجوال مع المقدمة
            let cleanedPhone = String(formData.phone || '').replace(/\D/g, '');

            // إزالة 0 من البداية إذا كان موجوداً (مثل 0501234567 -> 501234567)
            if (cleanedPhone.startsWith('0')) {
                cleanedPhone = cleanedPhone.substring(1);
            }

            const fullPhone = `${formData.dial_code}${cleanedPhone}`;

            // إضافة الحقول الأساسية بشكل صريح
            formDataToSend.append('name', formData.name || '');
            formDataToSend.append('email', formData.email || '');
            formDataToSend.append('phone', fullPhone);
            formDataToSend.append('city', formData.city || '');
            formDataToSend.append('password', formData.password || '');
            formDataToSend.append('password_confirmation', formData.password_confirmation || '');

            if (formData.bio) {
                formDataToSend.append('bio', formData.bio);
            }

            if (formData.profile_image) {
                formDataToSend.append('profile_image', formData.profile_image);
            }

            // إضافة subjects و stages (مطلوبة)
            if (formData.subjects && formData.subjects.length > 0) {
                formDataToSend.append('subjects', JSON.stringify(formData.subjects));
            } else {
                formDataToSend.append('subjects', JSON.stringify([]));
            }

            if (formData.stages && formData.stages.length > 0) {
                formDataToSend.append('stages', JSON.stringify(formData.stages));
            } else {
                formDataToSend.append('stages', JSON.stringify([]));
            }

            // إضافة price_per_hour
            const price = parseFloat(formData.price_per_hour) || 0;
            formDataToSend.append('price_per_hour', price);

            // إضافة certifications و experiences (اختيارية)
            if (formData.certifications && formData.certifications.length > 0) {
                formDataToSend.append('certifications', JSON.stringify(formData.certifications));
            }

            if (formData.experiences && formData.experiences.length > 0) {
                formDataToSend.append('experiences', JSON.stringify(formData.experiences));
            }

            // Log البيانات المرسلة للتشخيص
            console.log('Form data being sent:', {
                name: formData.name,
                email: formData.email,
                phone: fullPhone,
                city: formData.city,
                subjects: formData.subjects,
                stages: formData.stages,
                price_per_hour: price,
                hasProfileImage: !!formData.profile_image,
            });

            const response = await axios.post('/join-teacher', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                console.log('✅ Form submitted successfully!');
                if (response.data.redirect) {
                    router.visit(response.data.redirect);
                    return;
                }
                setSuccess(true);
                setTimeout(() => {
                    router.visit('/');
                }, 3000);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            console.error('Error response:', err.response?.data);

            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat();
                console.error('Validation errors:', errorMessages);
                console.error('Validation errors details:', err.response.data.errors);
                setError('يرجى تصحيح الأخطاء التالية: ' + errorMessages.join(', '));
            } else if (err.response?.data?.message) {
                console.error('Error message:', err.response.data.message);
                setError(err.response.data.message);
            } else {
                console.error('General error:', err.message);
                setError('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 text-center">
                <div className="text-green-500 text-6xl mb-4">
                    <FaCheck />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">تم إرسال طلبك بنجاح!</h2>
                <p className="text-gray-600 mb-6">
                    شكراً لك على اهتمامك بالانضمام إلى منصة معلمك. سيتم مراجعة طلبك من قبل الإدارة وسنعاود التواصل معك قريباً.
                </p>
                <div className="text-sm text-gray-500">
                    سيتم توجيهك إلى الصفحة الرئيسية خلال ثوانٍ قليلة...
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <FaExclamationTriangle className="text-red-500" />
                    <span className="text-red-700">{error}</span>
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">المعلومات الشخصية</h2>

                <div className="mb-6 text-center">
                    <label htmlFor="profile_image" className="cursor-pointer">
                        <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 hover:bg-yellow-200 transition duration-300">
                            {formData.profile_image ? (
                                <img
                                    src={URL.createObjectURL(formData.profile_image)}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <FaPlus className="text-yellow-600 text-3xl" />
                            )}
                        </div>
                        <p className="text-sm text-gray-600">الصورة الشخصية</p>
                    </label>
                    <input
                        type="file"
                        id="profile_image"
                        name="profile_image"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="محمد العتيبي"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="mohammed.otaibi@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال *</label>
                        <div className="flex gap-2">
                            <select
                                value={formData.dial_code}
                                onChange={handleDialCodeChange}
                                className="w-1/3 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50 text-sm"
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
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="512345678"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">المدينة *</label>
                        <select
                            name="city"
                            value={formData.city || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            required
                        >
                            <option value="">اختر المدينة</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور *</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 pe-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور *</label>
                        <div className="relative">
                            <input
                                type={showPasswordConfirm ? "text" : "password"}
                                name="password_confirmation"
                                value={formData.password_confirmation || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 pe-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">نبذة شخصية</label>
                        <textarea
                            name="bio"
                            value={formData.bio || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="اكتب نبذة مختصرة عن نفسك وخبراتك..."
                        />
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">الشهادات</h2>

                {certifications.map((cert) => (
                    <div key={cert.id} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                        <p className="text-gray-800">{cert.name} - {cert.issuer}</p>
                        <button
                            onClick={() => removeCertification(cert.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="اسم الشهادة"
                        value={newCertification.name || ''}
                        onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <input
                        type="text"
                        placeholder="جهة الإصدار"
                        value={newCertification.issuer || ''}
                        onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                </div>
                <button
                    type="button"
                    onClick={addCertification}
                    disabled={!newCertification.name || !newCertification.issuer}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg shadow-sm transition duration-300 ease-out hover:bg-yellow-500 hover:text-yellow-950 hover:shadow-lg hover:-translate-y-0.5 disabled:bg-yellow-200 disabled:text-yellow-700 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                >
                    <FaPlus />
                    إضافة
                </button>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">الخبرات</h2>

                {experiences.map((exp) => (
                    <div key={exp.id} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                                <p className="text-sm text-gray-600">{exp.duration}</p>
                            </div>
                            <button
                                onClick={() => removeExperience(exp.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <FaTrash />
                            </button>
                        </div>
                        <p className="text-gray-700">{exp.description}</p>
                    </div>
                ))}

                <div className="space-y-4 mb-4">
                    <input
                        type="text"
                        placeholder="المسمى الوظيفي"
                        value={newExperience.title || ''}
                        onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <input
                        type="text"
                        placeholder="جهة التوظيف"
                        value={newExperience.employer || ''}
                        onChange={(e) => setNewExperience({ ...newExperience, employer: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="date"
                            placeholder="تاريخ البداية"
                            value={newExperience.startDate || ''}
                            onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        <input
                            type="date"
                            placeholder="تاريخ النهاية"
                            value={newExperience.endDate || ''}
                            onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                            disabled={newExperience.stillWorking}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100"
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={newExperience.stillWorking || false}
                            onChange={(e) => setNewExperience({ ...newExperience, stillWorking: e.target.checked })}
                            className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm text-gray-700">لازلت أعمل في هذه الوظيفة</span>
                    </label>
                    <textarea
                        placeholder="الوصف"
                        value={newExperience.description || ''}
                        onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                </div>
                <button
                    type="button"
                    onClick={addExperience}
                    disabled={!newExperience.title || !newExperience.employer || !newExperience.startDate}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg shadow-sm transition duration-300 ease-out hover:bg-yellow-500 hover:text-yellow-950 hover:shadow-lg hover:-translate-y-0.5 disabled:bg-yellow-200 disabled:text-yellow-700 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                >
                    <FaPlus />
                    إضافة خبرة
                </button>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">المواد والمراحل الدراسية</h2>

                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">اختر المراحل الدراسية التي ترغب بتدريسها عبر المنصة: *</p>
                    <div className="flex flex-wrap gap-4">
                        {['الابتدائية', 'المتوسطة', 'الثانوية'].map((stage) => (
                            <label key={stage} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="stages"
                                    value={stage}
                                    checked={formData.stages.includes(stage)}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                />
                                <span className="text-gray-700">{stage}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">اختر المواد التي ترغب بتدريسها عبر المنصة: *</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {subjects.map((subject) => (
                            <label key={subject.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="subjects"
                                    value={subject.id}
                                    checked={formData.subjects.includes(subject.id)}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                />
                                <span className="text-gray-700">{subject.name_ar}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">سعر الحصة (ساعة) *</label>
                    <input
                        type="number"
                        name="price_per_hour"
                        value={formData.price_per_hour || 0}
                        onChange={handleInputChange}
                        placeholder="500"
                        min="1"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        required
                    />
                    <p className="text-sm text-gray-500 mt-1">السعر بالريال السعودي</p>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold rounded-lg text-md transition duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            جاري الإرسال...
                        </>
                    ) : (
                        'انضم كمعلم'
                    )}
                </button>
            </div>
        </form>
    );
}
