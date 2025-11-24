import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import TeachersFilters from '../Components/Teachers/TeachersFilters';
import TeacherCard from '../Components/Teachers/TeacherCard';
import CTASection from '../Components/Sections/CTASection';
import SectionTitle from '../Components/SectionTitle';

export default function Teachers({ auth, teachers = [], filters: initialFilters = {}, filterOptions = {} }) {
    const normalizeFilterValue = (value) => {
        if (!value || value === '') return '';
        if (Array.isArray(value)) return value;
        if (typeof value === 'string' && value.includes(',')) {
            return value.split(',').map(v => v.trim()).filter(v => v);
        }
        return value;
    };

    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        city: normalizeFilterValue(initialFilters.city),
        subject: normalizeFilterValue(initialFilters.subject),
        stage: normalizeFilterValue(initialFilters.stage),
        experience: normalizeFilterValue(initialFilters.experience),
        price: normalizeFilterValue(initialFilters.price),
        rating: normalizeFilterValue(initialFilters.rating),
        sessions: normalizeFilterValue(initialFilters.sessions),
    });

    const applyFilters = (newFilters) => {
        const cleanFilters = {};

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                if (Array.isArray(value) && value.length > 0) {
                    cleanFilters[key] = value;
                } else if (!Array.isArray(value)) {
                    cleanFilters[key] = value;
                }
            }
        });

        router.get('/teachers', cleanFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (filterType, value, label) => {
        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const handleSearchChange = (value) => {
        const newFilters = { ...filters, search: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    return (
        <MainLayout auth={auth}>
            <Head title="المعلمون - معلمك" />

            <section className="py-6 pb-2 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <SectionTitle
                            text="ابحث عن معلمك المثالي بسهولة"
                            size="2xl"
                            align="center"
                            className="pb-2"
                        />

                        <p className="mb-6 text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed">
                            تصفح قائمة واسعة من المعلمين الخصوصيين في مختلف المواد والمراحل، واختر على أساس الخبرة والموقع والتقييمات.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-6 pt-2">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1">
                            <TeachersFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                filterOptions={filterOptions}
                            />
                        </div>

                        <div className="lg:col-span-3">
                            {Object.values(filters).some(v => {
                                if (Array.isArray(v)) return v.length > 0;
                                return v !== '' && v !== null && v !== undefined;
                            }) && (
                                    <div className="mb-6 mt-8">
                                        <div className="flex flex-wrap items-center gap-2 justify-start">
                                            <button
                                                onClick={() => {
                                                    const emptyFilters = {
                                                        search: '',
                                                        city: '',
                                                        subject: '',
                                                        stage: '',
                                                        experience: '',
                                                        price: '',
                                                        rating: '',
                                                        sessions: '',
                                                    };
                                                    setFilters(emptyFilters);
                                                    applyFilters(emptyFilters);
                                                }}
                                                className="underline text-yellow-400 text-sm font-medium transition duration-300"
                                            >
                                                مسح الكل
                                            </button>
                                        </div>
                                    </div>
                                )}

                            {teachers && teachers.data && teachers.data.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {teachers.data.map((teacher) => (
                                            <TeacherCard key={teacher.id} teacher={teacher} />
                                        ))}
                                    </div>

                                    {teachers.links && teachers.links.length > 3 && (
                                        <div className="mt-8 flex justify-center">
                                            <div className="flex gap-2">
                                                {teachers.links.map((link, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => link.url && router.get(link.url)}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                        className={`px-4 py-2 rounded-lg border ${link.active
                                                            ? 'bg-yellow-400 text-black border-yellow-400'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 text-lg">لا يوجد معلمون متاحون</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <CTASection />
        </MainLayout>
    );
}
