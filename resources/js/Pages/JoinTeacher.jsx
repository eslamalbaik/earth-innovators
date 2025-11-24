import { Head } from '@inertiajs/react';
import { FaChevronLeft } from 'react-icons/fa';
import MainLayout from '../Layouts/MainLayout';
import JoinTeacherForm from '../Components/JoinTeacher/JoinTeacherForm';

export default function JoinTeacher({ auth, subjects = [], cities = [] }) {
    return (
        <MainLayout auth={auth}>
            <Head title="انضم لنا كمعلم - معلمك" />

            {/* Breadcrumb */}
            <section className="py-4 bg-gray-50">
                <div className="max-w-4xl mx-auto text-sm text-gray-600 flex justify-start items-center gap-0.5">
                    <span>الرئيسية</span>
                    <span className="mx-1"><FaChevronLeft className="text-xs" /></span>
                    <span className="text-gray-900 font-medium">انضم لنا كمعلم</span>
                </div>
            </section>

            <section className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            انضم إلى فريق معلمك وابدأ في صنع الفرق في مسيرة طلابك التعليمية
                        </h1>
                        <p className="text-lg text-gray-600">
                            نحن نبحث عن معلمين موهوبين ومتحمسين للانضمام إلى منصتنا ومساعدة الطلاب في تحقيق أهدافهم التعليمية.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-8 bg-yellow-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <JoinTeacherForm subjects={subjects} cities={cities} />
                </div>
            </section>
        </MainLayout>
    );
}
