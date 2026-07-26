import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { FaSearch, FaChartLine, FaUsers, FaSyncAlt, FaSpinner } from 'react-icons/fa';
import ClassificationBadge from '@/Components/Innovation/ClassificationBadge';
import { useTranslation } from '@/i18n';

const COLUMNS = [
    { key: 'ready', label: 'جاهزون', emoji: '🟢', ring: 'border-green-200', head: 'bg-green-50 text-green-800' },
    { key: 'developing', label: 'للتطوير', emoji: '🟡', ring: 'border-amber-200', head: 'bg-amber-50 text-amber-800' },
    { key: 'gaps', label: 'فجوات', emoji: '🔴', ring: 'border-red-200', head: 'bg-red-50 text-red-800' },
];

export default function AdminTalentMap({ buckets, counts, avgScore, schools = [], filters = {}, indexNames = {} }) {
    const { language } = useTranslation();
    const [schoolId, setSchoolId] = useState(filters.school_id || '');
    const [search, setSearch] = useState(filters.search || '');
    const [processingAll, setProcessingAll] = useState(false);
    const [processingStudents, setProcessingStudents] = useState({});

    const applyFilters = (e) => {
        e?.preventDefault();
        router.get(route('admin.innovation.talent-map'), {
            school_id: schoolId || undefined,
            search: search || undefined,
        }, { preserveScroll: true, preserveState: true });
    };

    const recalculateAll = () => {
        if (!confirm('هل أنت متأكد من إعادة حساب المؤشرات لجميع الطلاب؟ قد يستغرق هذا بعض الوقت.')) return;
        setProcessingAll(true);
        router.post(route('admin.innovation.recalculate'), { all: true }, {
            preserveScroll: true,
            onFinish: () => setProcessingAll(false)
        });
    };

    const recalculateStudent = (studentId) => {
        setProcessingStudents(prev => ({ ...prev, [studentId]: true }));
        router.post(route('admin.innovation.recalculate'), { user_id: studentId }, {
            preserveScroll: true,
            onFinish: () => setProcessingStudents(prev => ({ ...prev, [studentId]: false }))
        });
    };

    const StudentCard = ({ student }) => {
        const isProcessing = student.status === 'processing' || processingStudents[student.id];

        return (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 flex items-center justify-between gap-3 group">
                <Link
                    href={route('admin.innovation.user-profile', student.id)}
                    className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-85 transition"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0 overflow-hidden">
                        {student.image ? (
                            <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                            <span>{(student.name || '؟').charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{student.name}</p>
                        {student.has_index ? (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs font-bold text-blue-700">{student.score}/100</span>
                                <ClassificationBadge details={student.classification_details} size="sm" />
                                {student.strongest && indexNames[student.strongest] && (
                                    <span className="text-[11px] text-gray-500">الأقوى: {indexNames[student.strongest]}</span>
                                )}
                            </div>
                        ) : (
                            <span className="text-[11px] text-gray-400 mt-1 inline-block">لم يُقيَّم بعد</span>
                        )}
                    </div>
                </Link>
                <button
                    onClick={() => recalculateStudent(student.id)}
                    disabled={isProcessing}
                    title="إعادة حساب المؤشرات"
                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition shrink-0"
                >
                    {isProcessing ? (
                        <FaSpinner className="animate-spin text-blue-600 w-4 h-4" />
                    ) : (
                        <FaSyncAlt className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>
        );
    };

    return (
        <DashboardLayout header="خريطة المواهب">
            <Head title="خريطة المواهب" />

            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="py-6 space-y-6">
                {/* لوحة التحكم وإعادة الحساب السريع */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm gap-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">إدارة حساب مؤشرات الطلاب</h2>
                        <p className="text-xs text-gray-500 mt-0.5">يمكنك إعادة حساب مؤشرات الابتكار والجاهزية لجميع الطلاب يدويًا لتحديث التصنيفات.</p>
                    </div>
                    <button
                        onClick={recalculateAll}
                        disabled={processingAll}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 w-full sm:w-auto"
                    >
                        {processingAll ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />}
                        إعادة حساب مؤشرات الجميع
                    </button>
                </div>

                {/* شريط الإحصائيات */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-500 mb-1"><FaUsers /><span className="text-xs">الإجمالي</span></div>
                        <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-500 mb-1"><FaChartLine /><span className="text-xs">مُقيَّمون</span></div>
                        <p className="text-2xl font-bold text-gray-900">{counts.assessed}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl shadow-sm p-4 text-center">
                        <p className="text-xs text-green-700 mb-1">🟢 جاهزون</p>
                        <p className="text-2xl font-bold text-green-800">{counts.ready}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl shadow-sm p-4 text-center">
                        <p className="text-xs text-amber-700 mb-1">🟡 للتطوير</p>
                        <p className="text-2xl font-bold text-amber-800">{counts.developing}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl shadow-sm p-4 text-center">
                        <p className="text-xs text-red-700 mb-1">🔴 فجوات</p>
                        <p className="text-2xl font-bold text-red-800">{counts.gaps}</p>
                    </div>
                </div>

                {/* الفلاتر */}
                <form onSubmit={applyFilters} className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-end">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">المدرسة</label>
                        <select
                            value={schoolId}
                            onChange={(e) => setSchoolId(e.target.value)}
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-400 focus:ring-blue-400"
                        >
                            <option value="">كل المدارس</option>
                            {schools.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">بحث بالاسم أو البريد</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="اكتب للبحث..."
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-400 focus:ring-blue-400"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                        <FaSearch /> تطبيق
                    </button>
                </form>

                {avgScore > 0 && (
                    <p className="text-sm text-gray-500">متوسط درجة الجاهزية للمُقيَّمين: <span className="font-bold text-gray-800">{avgScore}/100</span></p>
                )}

                {/* الأعمدة الثلاثة */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {COLUMNS.map((col) => (
                        <div key={col.key} className={`bg-gray-50 rounded-xl border ${col.ring} overflow-hidden`}>
                            <div className={`px-4 py-3 font-bold flex items-center justify-between ${col.head}`}>
                                <span>{col.emoji} {col.label}</span>
                                <span className="text-sm">{counts[col.key]}</span>
                            </div>
                            <div className="p-3 space-y-3 max-h-[65vh] overflow-y-auto">
                                {buckets[col.key] && buckets[col.key].length > 0 ? (
                                    buckets[col.key].map((student) => (
                                        <StudentCard key={student.id} student={student} />
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-gray-400 py-6">لا يوجد طلاب هنا</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-gray-400">
                    * التصنيف آلي بناءً على درجة الجاهزية المحسوبة من محرك التقييم. الطلاب غير المُقيَّمين يظهرون ضمن "الفجوات" لحين حساب مؤشراتهم.
                </p>
            </div>
        </DashboardLayout>
    );
}
