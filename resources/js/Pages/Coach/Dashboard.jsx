import { Head, Link } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { useState } from "react";
import { useTranslation } from "@/i18n";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";

const CLASSIFICATION_COLORS = {
    diamond: "#67e8f9",
    platinum: "#d1d5db",
    gold: "#fbbf24",
    silver: "#9ca3af",
    bronze: "#f97316",
    developing: "#4ade80",
};

export default function CoachDashboard({
    auth,
    students,
    totalStudents,
    indexNames,
    classifications,
    statistics,
}) {
    const { t } = useTranslation();
    const [compareIds, setCompareIds] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [sortBy, setSortBy] = useState("overall_score");

    const sortedStudents = [...students].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name, "ar");
        return (b[sortBy] || 0) - (a[sortBy] || 0);
    });

    // Classification distribution chart data
    const classificationData = Object.entries(
        statistics.classifications || {},
    ).map(([key, count]) => ({
        name: t(`innovationIndex.classifications.${key}`),
        count,
        fill: CLASSIFICATION_COLORS[key] || "#A3C042",
    }));

    const toggleCompare = (id) => {
        setCompareIds((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id].slice(-4),
        );
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={t('coachDashboard.pageTitle')} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('coachDashboard.heading')}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {t('coachDashboard.subtitle', { count: totalStudents })}
                        </p>
                    </div>
                    {compareIds.length >= 2 && (
                        <Link
                            href={route("teacher.innovation.compare", {
                                students: compareIds,
                            })}
                            className="px-5 py-2.5 bg-gradient-to-r from-[#A3C042] to-[#8da835] hover:from-[#8da835] hover:to-[#768e2a] text-white rounded-xl text-sm font-medium transition-all shadow-md"
                        >
                            {t('coachDashboard.compareButton', { count: compareIds.length })}
                        </Link>
                    )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-gray-200">
                        <p className="text-3xl font-black text-[#A3C042]">
                            {totalStudents}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('coachDashboard.stats.totalStudents')}
                        </p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-gray-200">
                        <p className="text-3xl font-black text-[#A3C042]">
                            {statistics.avg_score}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('coachDashboard.stats.avgScore')}
                        </p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-gray-200">
                        <p className="text-3xl font-black text-[#A3C042]">
                            {statistics.needs_attention?.length || 0}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('coachDashboard.stats.needsAttention')}
                        </p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-gray-200">
                        <p className="text-3xl font-black text-[#A3C042]">
                            {statistics.top_students?.length || 0}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{t('coachDashboard.stats.topStudents')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Students List */}
                    <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">
                                {t('coachDashboard.studentsList')}
                            </h3>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300"
                            >
                                <option value="overall_score">
                                    {t('coachDashboard.sortByScore')}
                                </option>
                                <option value="name">{t('coachDashboard.sortByName')}</option>
                            </select>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {sortedStudents.map((student, idx) => (
                                <div
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student)}
                                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                                        selectedStudent?.id === student.id
                                            ? "bg-[#f4f7eb]"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={compareIds.includes(
                                                student.id,
                                            )}
                                            onChange={() =>
                                                toggleCompare(student.id)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-4 h-4 rounded border-gray-300 text-[#A3C042] focus:ring-[#A3C042]"
                                            title={t('coachDashboard.selectForCompare')}
                                        />
                                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A3C042] to-[#8da835] flex items-center justify-center text-white font-bold text-sm">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {
                                                    student
                                                        .classification_details
                                                        ?.icon
                                                }
                                                {t(`innovationIndex.classifications.${student.classification}`)}
                                            </p>
                                            {student.strongest && (
                                                <p className="text-sm text-[#A3C042]">
                                                    &#8226; {t('coachDashboard.strongest')}{" "}
                                                    {t(`innovationIndex.names.${student.strongest}`)}
                                                </p>
                                            )}
                                            <Link
                                                href={route(
                                                    "teacher.innovation.student-report",
                                                    student.id,
                                                )}
                                                className="px-3 py-1 bg-[#e5efc7] text-[#A3C042] rounded-lg text-xs font-medium hover:bg-[#d6e7a2] transition-colors"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {t('coachDashboard.aiReport')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Student Details */}
                    <div className="lg:col-span-1 space-y-6">
                        {selectedStudent ? (
                            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-1">
                                    {selectedStudent.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    {
                                        selectedStudent.classification_details
                                            ?.icon
                                    }
                                    {""}
                                    {t(`innovationIndex.classifications.${selectedStudent.classification}`)}
                                    {""}— {selectedStudent.overall_score}{t('coachDashboard.outOf100')}
                                </p>

                                <ResponsiveContainer width="100%" height={250}>
                                    <RadarChart
                                        data={Object.keys(indexNames).map(
                                            (key) => ({
                                                index: t(`innovationIndex.names.${key}`),
                                                value:
                                                    selectedStudent.indexes?.[
                                                        key
                                                    ] || 0,
                                            }),
                                        )}
                                    >
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis
                                            dataKey="index"
                                            tick={{
                                                fill: "#64748b",
                                                fontSize: 10,
                                            }}
                                        />
                                        <PolarRadiusAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 9 }}
                                        />
                                        <Radar
                                            dataKey="value"
                                            stroke="#A3C042"
                                            fill="#A3C042"
                                            fillOpacity={0.3}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>

                                {selectedStudent.weakest && (
                                    <div className="mt-3 p-3 bg-amber-50 rounded-xl text-sm">
                                        <span className="font-bold text-amber-700">
                                            {t('coachDashboard.weakness')}
                                        </span>
                                        <span className="text-amber-600 mr-1">
                                            {t(`innovationIndex.names.${selectedStudent.weakest}`)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center text-gray-400">
                                <span className="text-4xl block mb-3">👆</span>
                                <p>{t('coachDashboard.selectStudentPrompt')}</p>
                            </div>
                        )}

                        {/* Classification Distribution */}
                        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-3">
                                {t('coachDashboard.classificationDistribution')}
                            </h3>
                            {classificationData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart
                                        data={classificationData}
                                        layout="vertical"
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e2e8f0"
                                        />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tick={{
                                                fill: "#64748b",
                                                fontSize: 11,
                                            }}
                                            width={60}
                                        />
                                        <Tooltip />
                                        <Bar
                                            dataKey="count"
                                            radius={[0, 6, 6, 0]}
                                        >
                                            {classificationData.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={entry.fill}
                                                    />
                                                ),
                                            )}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-gray-400 py-6">
                                    {t('coachDashboard.noData')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
