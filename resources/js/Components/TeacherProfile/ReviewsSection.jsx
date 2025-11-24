import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FaStar, FaEdit, FaChevronDown } from 'react-icons/fa';
import { getInitials, getColorFromName } from '../../utils/imageUtils';
import ReviewModal from './ReviewModal';
import { usePage } from '@inertiajs/react';

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

export default function ReviewsSection({ reviews = [], teacherId, reviewsTotal = 0, reviewsPage = 1, hasMoreReviews = false }) {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const { auth } = usePage().props;

    const handleLoadMore = () => {
        router.get(window.location.pathname, { reviews_page: reviewsPage + 1 }, {
            preserveState: true,
            preserveScroll: true,
            only: ['teacher'],
        });
    };
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">تقييمات أولياء الأمور</h2>
                <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="bg-yellow-50 text-yellow-500 border border-yellow-500 hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition duration-300"
                >
                    <FaEdit className="text-sm" />
                    اكتب تقييمك
                </button>
            </div>

            {!reviews || reviews.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">لا توجد تقييمات متاحة حالياً</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-4 sm:px-6 lg:px-8  border border-gray-200 bg-white shadow-lg rounded-2xl">
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <p className="text-gray-700 mb-4 leading-relaxed">
                                    {review.comment}
                                </p>

                                <div className="flex items-center gap-3">
                                    {review.reviewerImage ? (
                                        <img
                                            src={getImageUrl(review.reviewerImage)}
                                            alt={review.reviewerName}
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${review.reviewerImage ? 'hidden' : ''}`}
                                        style={{
                                            background: `linear-gradient(135deg, ${getColorFromName(review.reviewerName).split(', ')[0]}, ${getColorFromName(review.reviewerName).split(', ')[1]})`,
                                        }}
                                    >
                                        {getInitials(review.reviewerName)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{review.reviewerName}</p>
                                        {review.reviewerLocation && (
                                            <p className="text-xs text-gray-500">{review.reviewerLocation}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMoreReviews && (
                        <div className="text-center">
                            <button
                                onClick={handleLoadMore}
                                className="border border-gray-300 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition duration-300"
                            >
                                اطلع على المزيد من التقييمات
                                <FaChevronDown className="text-sm" />
                            </button>
                        </div>
                    )}
                </>
            )}

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                teacherId={teacherId}
                auth={auth}
            />
        </div>
    );
}
