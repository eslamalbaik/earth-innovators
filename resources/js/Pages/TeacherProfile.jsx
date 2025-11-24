import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import MainLayout from '../Layouts/MainLayout';
import TeacherProfileHeader from '../Components/TeacherProfile/TeacherProfileHeader';
import ExperienceSection from '../Components/TeacherProfile/ExperienceSection';
import CertificationsSection from '../Components/TeacherProfile/CertificationsSection';
import ReviewsSection from '../Components/TeacherProfile/ReviewsSection';
import BookingModal from '../Components/Booking/BookingModal';

export default function TeacherProfile({ auth, teacher = {} }) {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const teacherData = {
        id: teacher.id || 0,
        name: teacher.name || '',
        image: teacher.image || null,
        rating: teacher.rating || 0,
        reviewsCount: teacher.reviewsCount || 0,
        location: teacher.location || '',
        subject: teacher.subject || '',
        subjects: teacher.subjects || [],
        price: teacher.price || '0',
        studentsCount: teacher.studentsCount || 0,
        sessionsCount: teacher.sessionsCount || 0,
        experience: teacher.experience || 0,
        isVerified: teacher.isVerified || false,
        bio: teacher.bio || '',
        experiences: teacher.experiences || [],
        certifications: teacher.certifications || [],
        reviews: teacher.reviews || [],
        availability: teacher.availability || [],
    };

    if (!teacher.id) {
        return (
            <MainLayout auth={auth}>
                <Head title="المعلم غير موجود" />
                <div className="max-w-5xl mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">المعلم غير موجود</h1>
                    <p className="text-gray-600">لم يتم العثور على المعلم المطلوب.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout auth={auth}>
            <Head title={`${teacherData.name} - معلمك`} />

            <section className="py-4 bg-gray-100">
                <div className="max-w-5xl mx-auto">
                    <div className="text-sm text-gray-600 flex justify-start items-center gap-0.5">
                        <span>الرئيسية</span>
                        <span className="mx-1"><FaChevronLeft className="text-xs" /></span>
                        <span>المعلمين</span>
                        <span className="mx-1"><FaChevronLeft className="text-xs" /></span>
                        <span className="text-gray-900 font-medium">{teacherData.name}</span>
                    </div>
                </div>
            </section>

            <section className="pt-12 pb-8 bg-white">
                <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8  border border-gray-200 bg-white shadow-lg rounded-2xl">
                    <TeacherProfileHeader teacher={teacherData} onBookClick={() => setIsBookingModalOpen(true)} />
                </div>
            </section>

            {teacherData.experiences.length > 0 || teacherData.certifications.length > 0 ? (
                <section className="pb-12 bg-white">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {teacherData.experiences.length > 0 && (
                                <div className="bg-white shadow-lg rounded-2xl border border-gray-200">
                                    <ExperienceSection experiences={teacherData.experiences} />
                                </div>
                            )}

                            {teacherData.certifications.length > 0 && (
                                <div className="bg-white shadow-lg rounded-2xl border border-gray-200">
                                    <CertificationsSection certifications={teacherData.certifications} />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            ) : null}

            <section className="py-8 bg-white">
                <div className="max-w-5xl mx-auto">
                    <ReviewsSection
                        reviews={teacherData.reviews}
                        teacherId={teacherData.id}
                        reviewsTotal={teacherData.reviewsTotal || 0}
                        reviewsPage={teacherData.reviewsPage || 1}
                        hasMoreReviews={teacherData.hasMoreReviews || false}
                    />
                </div>
            </section>

            <BookingModal
                teacher={teacherData}
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
            />
        </MainLayout>
    );
}
