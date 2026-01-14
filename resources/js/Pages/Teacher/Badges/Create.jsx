import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FaMedal, FaSave, FaArrowRight } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';

export default function CreateBadge({ schools, auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        icon: '',
        image: null,
        type: 'custom',
        points_required: 0,
        school_id: '',
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/teacher/badges', {
            forceFormData: true,
            onSuccess: () => {
                router.visit('/teacher/badges');
            },
        });
    };

    return (
        <DashboardLayout header="إرسال شارة جديدة">
            <Head title="إرسال شارة جديدة - إرث المبتكرين" />

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6 flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-[#A3C042] to-legacy-blue rounded-lg">
                        <FaMedal className="text-white text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">إرسال شارة جديدة</h2>
                        <p className="text-gray-600">املأ البيانات التالية لإرسال الشارة للمراجعة</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اسم الشارة (إنجليزي) *
                            </label>
                            <TextInput
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اسم الشارة (عربي) *
                            </label>
                            <TextInput
                                type="text"
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                className="w-full"
                                required
                            />
                            {errors.name_ar && <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            وصف الشارة (عربي)
                        </label>
                        <textarea
                            value={data.description_ar}
                            onChange={(e) => setData('description_ar', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                            rows="3"
                        />
                        {errors.description_ar && <p className="text-red-500 text-sm mt-1">{errors.description_ar}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            وصف الشارة (إنجليزي)
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                            rows="3"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نوع الشارة *
                            </label>
                            <SelectInput
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                required
                            >
                                <option value="custom">مخصص</option>
                                <option value="rank_first">المركز الأول</option>
                                <option value="rank_second">المركز الثاني</option>
                                <option value="rank_third">المركز الثالث</option>
                                <option value="excellent_innovator">مبتكر مميز</option>
                                <option value="active_participant">مشارك نشط</option>
                            </SelectInput>
                            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                النقاط المطلوبة *
                            </label>
                            <TextInput
                                type="number"
                                value={data.points_required}
                                onChange={(e) => setData('points_required', parseInt(e.target.value))}
                                className="w-full"
                                min="0"
                                required
                            />
                            {errors.points_required && <p className="text-red-500 text-sm mt-1">{errors.points_required}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            المدرسة *
                        </label>
                        <SelectInput
                            value={data.school_id}
                            onChange={(e) => setData('school_id', e.target.value)}
                            required
                        >
                            <option value="">اختر المدرسة</option>
                            {schools && schools.map((school) => (
                                <option key={school.id} value={school.id}>
                                    {school.name}
                                </option>
                            ))}
                        </SelectInput>
                        {errors.school_id && <p className="text-red-500 text-sm mt-1">{errors.school_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            أيقونة الشارة
                        </label>
                        <TextInput
                            type="text"
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                            className="w-full"
                            placeholder="مثال: star, medal, trophy"
                        />
                        {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            صورة الشارة
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#A3C042] file:text-white hover:file:bg-primary-600"
                            />
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-24 h-24 rounded-lg object-cover border border-gray-300"
                                />
                            )}
                        </div>
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.visit('/teacher/badges')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                            إلغاء
                        </button>
                        <PrimaryButton type="submit" disabled={processing} className="flex items-center gap-2">
                            {processing ? (
                                'جاري الإرسال...'
                            ) : (
                                <>
                                    <FaSave />
                                    إرسال للمراجعة
                                    <FaArrowRight />
                                </>
                            )}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

