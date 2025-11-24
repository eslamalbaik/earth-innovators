import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import HeroSection from '../Components/Sections/HeroSection';
import WhyChooseSection from '../Components/Sections/WhyChooseSection';
import CTABannerSection from '../Components/Sections/CTABannerSection';
import PlatformFeaturesSection from '../Components/Sections/PlatformFeaturesSection';
import SubjectsSection from '../Components/Sections/SubjectsSection';
import TeachersSection from '../Components/Sections/TeachersSection';
import TeacherRecruitmentSection from '../Components/Sections/TeacherRecruitmentSection';
import TestimonialsSection from '../Components/Sections/TestimonialsSection';
import FAQSection from '../Components/Sections/FAQSection';
import CTASection from '../Components/Sections/CTASection';
import PublicationsSection from '../Components/Sections/PublicationsSection';

export default function Home({ auth, cities = [], subjects = [], featuredTeachers = [], testimonials = [], stats = [], featuredPublications = [] }) {
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const benefits = [
        {
            title: "مشاركة المشاريع الإبداعية",
            description: "ارفع مشاريعك الإبداعية (ملفات، صور، تقارير) وشاركها مع المجتمع التعليمي. احصل على تقييمات من المعلمين والمشرفين."
        },
        {
            title: "التحديات والمسابقات",
            description: "شارك في تحديات تعليمية متنوعة في مختلف المجالات والفئات العمرية. تنافس مع زملائك وحقق مراكز متقدمة."
        },
        {
            title: "الترتيب والمنافسة",
            description: "تنافس مع المدارس الأخرى وحقق ترتيب متقدم. تابع إحصائيات مدرستك ومقارنتها مع المدارس الأخرى."
        }
    ];

    const faqData = [
        {
            question: "كيف يمكنني مشاركة مشروعي الإبداعي؟",
            answer: "يمكنك رفع مشروعك من خلال لوحة التحكم. قم بتسجيل الدخول، ثم اضغط على 'إضافة مشروع جديد' واملأ البيانات المطلوبة (العنوان، الوصف، الملفات، الصور، التقرير). سيتم مراجعته من قبل المعلمين أو الإدارة قبل الموافقة عليه."
        },
        {
            question: "كيف أحصل على الشارات والنقاط؟",
            answer: "تحصل على الشارات والنقاط عند مشاركة المشاريع، المشاركة في التحديات، تحقيق مراكز متقدمة، أو عند إنجازات معينة. كل شارة لها متطلباتها الخاصة من النقاط أو الإنجازات."
        },
        {
            question: "كيف يمكنني المشاركة في التحديات؟",
            answer: "تصفح قائمة التحديات النشطة، اختر التحدي المناسب لفئتك العمرية ومجال اهتمامك، ثم قم برفع مشروعك المرتبط بالتحدي. يجب أن يتم التقديم قبل الموعد النهائي للتحدي."
        },
        {
            question: "ما هي الباقات المتاحة وكيف يمكنني الاشتراك؟",
            answer: "نوفر باقات متنوعة للمدارس والطلاب (شهرية، ربع سنوية، سنوية). كل باقة توفر ميزات مختلفة مثل عدد المشاريع المسموح بها، عدد التحديات، إمكانية الحصول على شهادات، وغيرها. يمكنك الاشتراك من صفحة الباقات."
        }
    ];

    const handleSearch = () => {
        router.visit('/projects');
    };

    const handleSubjectClick = (subject) => {
        const subjectName = subject.name_ar || subject.name || subject.name_en;
        router.get('/projects', { category: subjectName });
    };

    const handleTeacherClick = (teacher) => {
        if (teacher && teacher.id) {
            router.visit(`/projects/${teacher.id}`);
        }
    };

    const handleViewAllTeachers = () => {
        router.visit('/projects');
    };

    const handleJoinTeacher = () => {
        router.visit('/register');
    };

    return (
        <MainLayout auth={auth}>
            <Head title="إرث المبتكرين - منصة الإبداع والتعلم" />

            <HeroSection
                cities={cities}
                subjects={subjects}
                onSearch={handleSearch}
            />

            <WhyChooseSection benefits={benefits} />

            <CTABannerSection
                onButtonClick={handleViewAllTeachers}
            />

            <PlatformFeaturesSection />

            <SubjectsSection
                subjects={subjects}
                onSubjectClick={handleSubjectClick}
            />

            <TeachersSection
                teachers={featuredTeachers}
                onTeacherClick={handleTeacherClick}
                onViewAllTeachers={handleViewAllTeachers}
            />

            <TeacherRecruitmentSection onJoinClick={handleJoinTeacher} />

            <TestimonialsSection testimonials={testimonials} />

            <FAQSection
                faqs={faqData}
                openFAQ={openFAQ}
                onToggleFAQ={setOpenFAQ}
            />

            <PublicationsSection publications={featuredPublications} />

            <CTASection />
        </MainLayout >
    );
}
