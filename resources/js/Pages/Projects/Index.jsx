import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { FaSearch, FaFilter, FaHeart, FaComment, FaTimes } from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';

export default function ProjectsIndex({ auth, projects, userRole, categories = [] }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterAgeGroup, setFilterAgeGroup] = useState('');
    const [filterSchool, setFilterSchool] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    // استخدام الفئات من قاعدة البيانات أو الفئات الافتراضية
    const defaultCategories = [
        { value: '', label: 'الكل' },
        { value: 'science', label: 'علوم' },
        { value: 'technology', label: 'تقنية' },
        { value: 'engineering', label: 'هندسة' },
        { value: 'mathematics', label: 'رياضيات' },
        { value: 'arts', label: 'فنون' },
        { value: 'other', label: 'أخرى' },
    ];

    const categoriesList = categories && categories.length > 0 ? categories : defaultCategories;

    const ageGroups = [
        { value: '6-9', label: '6-9 سنوات' },
        { value: '10-13', label: '10-13 سنة' },
        { value: '14-17', label: '14-17 سنة' },
        { value: '18+', label: '18+ سنة' },
    ];

    const schools = [
        { value: 'primary', label: 'المدرسة الابتدائية' },
        { value: 'middle', label: 'المدرسة المتوسطة' },
        { value: 'high', label: 'المدرسة الثانوية' },
        { value: 'university', label: 'الجامعة' },
    ];

    // استخدام الفئات من قاعدة البيانات للفلترة أيضاً
    const subjects = categoriesList.filter(c => c.value !== '').map(cat => ({
        value: cat.value,
        label: cat.label,
    }));

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/projects', { search, category }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleApplyFilters = () => {
        router.get('/projects', {
            search,
            category,
            age_group: filterAgeGroup,
            school: filterSchool,
            subject: filterSubject,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setFilterAgeGroup('');
        setFilterSchool('');
        setFilterSubject('');
        router.get('/projects', { search, category }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getCategoryLabel = (cat) => {
        const found = categoriesList.find((c) => c.value === cat);
        return found ? found.label : 'أخرى';
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const filteredProjects = useMemo(() => {
        return projects?.data || [];
    }, [projects?.data]);

    const ProjectsContent = ({ isDesktop = false }) => (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setShowFilterModal(true)}
                    className="h-10 w-10 rounded-xl bg-[#A3C042] flex items-center justify-center hover:bg-[#8CA635] transition flex-shrink-0"
                    aria-label="فلترة"
                >
                    <FaFilter className="text-white text-sm" />
                </button>
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث عن المشاريع .."
                            className="w-full h-10 pr-10 pl-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30 focus:border-[#A3C042] text-sm"
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                </form>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categoriesList.map((cat) => (
                    <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                            setCategory(cat.value);
                            router.get('/projects', { search, category: cat.value }, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${category === cat.value
                                ? 'bg-[#A3C042] text-white'
                                : 'bg-white text-gray-700'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Projects Count */}
            <div className="text-sm text-gray-700">
                {filteredProjects.length} مشاريع
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {filteredProjects.map((project) => {
                        const isWinner = project.rating >= 4.5 || project.is_winner;
                        const categoryLabel = getCategoryLabel(project.category);
                        const projectImage = project.image || project.thumbnail || '/images/hero.png';
                        const ageRange = project.age_range || '13-10 سنة';
                        const schoolName = project.school?.name || 'المدرسة المتوسطة';
                        const teacherName = project.teacher?.name_ar || project.user?.name || 'أحمد محمد';
                        const likes = project.likes || 24;
                        const comments = project.comments_count || 8;
                        const isLiked = project.is_liked || false;

                        return (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition"
                            >
                                <div className="relative">
                                    <img
                                        src={projectImage}
                                        alt={project.title}
                                        className="w-full h-32 object-cover"
                                    />
                                    {isWinner && (
                                        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                                            مشروع فائز
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-semibold border border-gray-200">
                                        {categoryLabel}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                                        {project.title || 'روبوت مساعد للمنزل'}
                                    </h3>
                                    <div className="text-xs text-gray-600 mb-2">
                                        {ageRange} • {schoolName} • {teacherName}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <FaHeart className={isLiked ? 'text-red-500 fill-current' : 'text-gray-400'} />
                                            <span>{likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FaComment className="text-gray-400" />
                                            <span>{comments}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FaSearch className="text-gray-400 text-4xl" />
                    </div>
                    <p className="text-gray-400 text-sm mb-2">لا توجد مشاريع تطابق معايير البحث</p>
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="text-[#A3C042] text-sm font-semibold hover:text-[#8CA635]"
                    >
                        عرض كل المشاريع
                    </button>
                </div>
            )}

            {/* Pagination */}
            {projects?.links && projects.links.length > 3 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {projects.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${link.active
                                        ? 'bg-[#A3C042] text-white'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="استكشف المشاريع - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                />
                <main className="px-4 pb-24 pt-4">
                    <ProjectsContent isDesktop={false} />
                </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <ProjectsContent isDesktop={true} />
                    </div>
                </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
                <DesktopFooter auth={auth} />
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowFilterModal(false)}
                                className="text-gray-700 text-xl leading-none"
                                aria-label="إغلاق"
                            >
                                <FaTimes />
                            </button>
                            <div className="text-sm font-extrabold text-gray-900">خيارات الفلترة</div>
                            <div className="w-6" />
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Age Group */}
                            <div>
                                <div className="text-sm font-bold text-gray-900 mb-3">الفئة العمرية</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {ageGroups.map((age) => (
                                        <button
                                            key={age.value}
                                            type="button"
                                            onClick={() => setFilterAgeGroup(filterAgeGroup === age.value ? '' : age.value)}
                                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${filterAgeGroup === age.value
                                                    ? 'bg-[#eef8d6] text-[#6b7f2c] border-2 border-[#A3C042]'
                                                    : 'bg-white text-gray-700 border border-gray-200'
                                                }`}
                                        >
                                            {age.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* School */}
                            <div>
                                <div className="text-sm font-bold text-gray-900 mb-3">المدرسة</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {schools.map((school) => (
                                        <button
                                            key={school.value}
                                            type="button"
                                            onClick={() => setFilterSchool(filterSchool === school.value ? '' : school.value)}
                                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${filterSchool === school.value
                                                    ? 'bg-[#eef8d6] text-[#6b7f2c] border-2 border-[#A3C042]'
                                                    : 'bg-white text-gray-700 border border-gray-200'
                                                }`}
                                        >
                                            {school.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject/Category */}
                            <div>
                                <div className="text-sm font-bold text-gray-900 mb-3">الفئة</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {categoriesList.filter(c => c.value !== '').map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => {
                                                const newCategory = category === cat.value ? '' : cat.value;
                                                setCategory(newCategory);
                                                setFilterSubject(newCategory);
                                            }}
                                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${category === cat.value
                                                    ? 'bg-[#eef8d6] text-[#6b7f2c] border-2 border-[#A3C042]'
                                                    : 'bg-white text-gray-700 border border-gray-200'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-4 py-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="w-full rounded-xl bg-[#A3C042] py-3 text-sm font-bold text-white hover:bg-[#8CA635] transition"
                            >
                                تطبيق الفلاتر
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
