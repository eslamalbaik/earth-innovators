import { useState, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { FaStar, FaTimes, FaUpload, FaSpinner } from 'react-icons/fa';

export default function ReviewModal({ isOpen, onClose, teacherId, auth }) {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        teacher_id: teacherId || null,
        rating: 0,
        comment: '',
        reviewer_name: auth?.user?.name || '',
        reviewer_location: auth?.user?.city || '',
        reviewer_image: null,
    });

    transform((data) => ({
        ...data,
        rating: Number(data.rating) || 0,
        teacher_id: Number(data.teacher_id) || null,
    }));

    useEffect(() => {
        if (teacherId) {
            setData('teacher_id', teacherId);
        }
    }, [teacherId, setData]);

    const handleClose = () => {
        if (!processing) {
            setHoveredRating(0);
            setImagePreview(null);
            reset();
            setData('rating', 0);
            onClose();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('الملف المحدد ليس صورة');
                return;
            }
            setData('reviewer_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const ratingValue = Number(data.rating);
        
        if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
            alert('الرجاء اختيار تقييم');
            return;
        }
        if (!data.comment.trim()) {
            alert('الرجاء كتابة تعليق');
            return;
        }
        if (!data.reviewer_name.trim()) {
            alert('الرجاء إدخال الاسم');
            return;
        }
        if (!data.teacher_id) {
            alert('خطأ: لم يتم تحديد المعلم');
            return;
        }

        setData('rating', ratingValue);
        setData('teacher_id', Number(data.teacher_id));
        
        const submitData = {
            ...data,
            rating: ratingValue,
            teacher_id: Number(data.teacher_id),
        };
        
        console.log('Submitting review data:', submitData);
        
        post(route('reviews.store'), {
            forceFormData: true,
            onSuccess: () => {
                handleClose();
                window.location.reload();
            },
            onError: (errors) => {
                console.error('Review submission errors:', errors);
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">اكتب تقييمك</h3>
                            <button
                                onClick={handleClose}
                                disabled={processing}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التقييم <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setData('rating', star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="focus:outline-none"
                                        >
                                            <FaStar
                                                className={`text-2xl transition-colors ${
                                                    star <= (hoveredRating || data.rating)
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {errors.rating && (
                                    <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الاسم <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.reviewer_name}
                                    onChange={(e) => setData('reviewer_name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="أدخل اسمك"
                                />
                                {errors.reviewer_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.reviewer_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الموقع
                                </label>
                                <input
                                    type="text"
                                    value={data.reviewer_location}
                                    onChange={(e) => setData('reviewer_location', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="أدخل موقعك (اختياري)"
                                />
                                {errors.reviewer_location && (
                                    <p className="mt-1 text-sm text-red-600">{errors.reviewer_location}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التعليق <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.comment}
                                    onChange={(e) => setData('comment', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="اكتب تقييمك هنا..."
                                />
                                {errors.comment && (
                                    <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الصورة الشخصية
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <FaUpload className="text-sm" />
                                        اختر صورة
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    {imagePreview && (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setData('reviewer_image', null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {errors.reviewer_image && (
                                    <p className="mt-1 text-sm text-red-600">{errors.reviewer_image}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={processing}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        'إرسال التقييم'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

