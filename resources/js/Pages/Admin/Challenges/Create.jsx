import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaArrowRight, FaSave, FaTimes, FaImage, FaTrash } from 'react-icons/fa';
import { useState, useRef } from 'react';

export default function AdminChallengesCreate({ schools }) {
    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        objective: '',
        description: '',
        image: null,
        instructions: '',
        challenge_type: '',
        category: '',
        age_group: '',
        school_id: '',
        start_date: '',
        deadline: '',
        status: 'draft',
        points_reward: 0,
        max_participants: null,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024; // 5 MB
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

            if (file.size > maxSize) {
                alert('الصورة أكبر من 5 ميجابايت');
                return;
            }

            if (!validTypes.includes(file.type)) {
                alert('نوع الصورة غير مدعوم. يرجى اختيار صورة بصيغة JPEG, PNG, GIF, أو WebP');
                return;
            }

            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.challenges.store'));
    };

    return (
        <DashboardLayout header="إضافة تحدٍ جديد">
            <Head title="إضافة تحدٍ جديد" />

            <div className="mb-6">
                <Link
                    href={route('admin.challenges.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة التحديات
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات التحدي</h2>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* العنوان */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عنوان التحدي <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {/* الهدف */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الهدف من التحدي <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.objective}
                                onChange={(e) => setData('objective', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.objective ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.objective && (
                                <p className="mt-1 text-sm text-red-600">{errors.objective}</p>
                            )}
                        </div>

                        {/* الوصف */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                وصف التحدي <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* صورة التحدي */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                صورة التحدي (اختياري)
                            </label>
                            <div>
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-64 object-cover rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => imageInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
                                    >
                                        <FaImage className="mx-auto text-gray-400 text-4xl mb-2" />
                                        <p className="text-gray-600">انقر لرفع صورة</p>
                                        <p className="text-sm text-gray-400 mt-1">JPEG, PNG, GIF, WebP (حد أقصى 5 ميجابايت)</p>
                                    </div>
                                )}
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    id="image"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                            )}
                        </div>

                        {/* كيفية التنفيذ */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                كيفية التنفيذ <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.instructions ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.instructions && (
                                <p className="mt-1 text-sm text-red-600">{errors.instructions}</p>
                            )}
                        </div>

                        {/* نوع التحدي */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نوع التحدي <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.challenge_type}
                                onChange={(e) => setData('challenge_type', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.challenge_type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="">اختر نوع التحدي</option>
                                <option value="cognitive">تحدّي معرفي</option>
                                <option value="applied">تحدّي تطبيقي/مهاري</option>
                                <option value="creative">تحدّي إبداعي</option>
                                <option value="artistic_creative">تحدّي إبداعي فني</option>
                                <option value="collaborative">تحدّي تعاوني</option>
                                <option value="analytical">تحدّي تحليلي/استقصائي</option>
                                <option value="technological">تحدّي تكنولوجي</option>
                                <option value="behavioral">تحدّي سلوكي/قيمي</option>
                                <option value="60_seconds">تحدّي 60 ثانية</option>
                                <option value="mental_math">حلها بدون قلم</option>
                                <option value="conversions">تحدّي التحويلات</option>
                                <option value="team_fastest">تحدّي الفريق الأسرع</option>
                                <option value="build_problem">ابنِ مسألة</option>
                                <option value="custom">تحدّي مخصص</option>
                            </select>
                            {errors.challenge_type && (
                                <p className="mt-1 text-sm text-red-600">{errors.challenge_type}</p>
                            )}
                        </div>

                        {/* الفئة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الفئة <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="">اختر الفئة</option>
                                <option value="science">علوم</option>
                                <option value="technology">تقنية</option>
                                <option value="engineering">هندسة</option>
                                <option value="mathematics">رياضيات</option>
                                <option value="arts">فنون</option>
                                <option value="other">أخرى</option>
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                            )}
                        </div>

                        {/* الفئة العمرية */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الفئة العمرية <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.age_group}
                                onChange={(e) => setData('age_group', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.age_group ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="">اختر الفئة العمرية</option>
                                <option value="6-9">6-9 سنوات</option>
                                <option value="10-13">10-13 سنة</option>
                                <option value="14-17">14-17 سنة</option>
                                <option value="18+">18+ سنة</option>
                            </select>
                            {errors.age_group && (
                                <p className="mt-1 text-sm text-red-600">{errors.age_group}</p>
                            )}
                        </div>

                        {/* المدرسة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المدرسة
                            </label>
                            <select
                                value={data.school_id}
                                onChange={(e) => setData('school_id', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.school_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">اختر مدرسة</option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </select>
                            {errors.school_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.school_id}</p>
                            )}
                        </div>

                        {/* تاريخ البدء */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                تاريخ البدء <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.start_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.start_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                            )}
                        </div>

                        {/* تاريخ الانتهاء */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                تاريخ الانتهاء <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.deadline ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.deadline && (
                                <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                            )}
                        </div>

                        {/* الحالة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الحالة
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.status ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="draft">مسودة</option>
                                <option value="active">نشط</option>
                                <option value="completed">مكتمل</option>
                                <option value="cancelled">ملغي</option>
                            </select>
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                            )}
                        </div>

                        {/* نقاط المكافأة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نقاط المكافأة
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.points_reward}
                                onChange={(e) => setData('points_reward', parseInt(e.target.value) || 0)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.points_reward ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.points_reward && (
                                <p className="mt-1 text-sm text-red-600">{errors.points_reward}</p>
                            )}
                        </div>

                        {/* الحد الأقصى للمشاركين */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الحد الأقصى للمشاركين
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.max_participants || ''}
                                onChange={(e) => setData('max_participants', e.target.value ? parseInt(e.target.value) : null)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.max_participants ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="غير محدود"
                            />
                            {errors.max_participants && (
                                <p className="mt-1 text-sm text-red-600">{errors.max_participants}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaSave />
                            {processing ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <Link
                            href={route('admin.challenges.index')}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg flex items-center gap-2"
                        >
                            <FaTimes />
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
