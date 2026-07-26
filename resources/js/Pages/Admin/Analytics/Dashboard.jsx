import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { FaChartBar, FaUsers, FaFileAlt, FaThumbsUp, FaEye, FaSchool } from 'react-icons/fa';
import { useTranslation } from '@/i18n';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AnalyticsDashboard({ auth }) {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [topSchools, setTopSchools] = useState([]);
    const [topStudents, setTopStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [statsRes, schoolsRes, studentsRes] = await Promise.all([
                axios.get('/api/analytics/dashboard-stats'),
                axios.get('/api/analytics/top-schools'),
                axios.get('/api/analytics/top-students'),
            ]);

            setStats(statsRes.data.data);
            setTopSchools(schoolsRes.data.data);
            setTopStudents(studentsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout auth={auth} header={<h2 className="text-xl font-semibold">{t('common.loading')}</h2>}>
                <Head title="Analytics Dashboard" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 text-center">
                        <p>{t('common.loading')}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            orange: 'bg-orange-50 text-orange-600 border-orange-200',
        };

        return (
            <div className={`rounded-lg border p-6 ${colors[color]}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-75">{label}</p>
                        <p className="mt-2 text-3xl font-bold">{value || 0}</p>
                    </div>
                    <Icon className="text-5xl opacity-20" />
                </div>
            </div>
        );
    };

    return (
        <AdminLayout auth={auth} header={<h2 className="text-xl font-semibold">📊 Analytics Dashboard</h2>}>
            <Head title="Analytics Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4">
                    {/* Key Stats */}
                    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard icon={FaFileAlt} label="Total Publications" value={stats?.total_publications} color="blue" />
                        <StatCard icon={FaThumbsUp} label="Total Likes" value={stats?.total_likes} color="green" />
                        <StatCard icon={FaEye} label="Total Views" value={stats?.total_views} color="purple" />
                        <StatCard icon={FaUsers} label="Total Students" value={stats?.total_students} color="orange" />
                    </div>

                    {/* Top Schools & Students */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Top Schools */}
                        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-3">
                                <FaSchool className="text-lg text-blue-600" />
                                <h3 className="text-lg font-bold">🏆 Top Schools</h3>
                            </div>

                            {topSchools && topSchools.length > 0 ? (
                                <div className="space-y-4">
                                    {topSchools.map((school, idx) => (
                                        <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{idx + 1}. {school.school_name}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {school.publication_count} publications • {school.total_likes} likes • {school.total_views} views
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600">{school.total_likes}</p>
                                                <p className="text-xs text-gray-500">engagement</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No data available</p>
                            )}
                        </div>

                        {/* Top Students */}
                        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-3">
                                <FaUsers className="text-lg text-green-600" />
                                <h3 className="text-lg font-bold">⭐ Top Students</h3>
                            </div>

                            {topStudents && topStudents.length > 0 ? (
                                <div className="space-y-4">
                                    {topStudents.map((student, idx) => (
                                        <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{idx + 1}. {student.author_name}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {student.publication_count} publications • {student.total_likes} likes • {student.total_views} views
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">{student.total_likes}</p>
                                                <p className="text-xs text-gray-500">engagement</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No data available</p>
                            )}
                        </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                            <p className="text-sm text-gray-600">Approved Publications</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.approved_publications || 0}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                            <p className="text-sm text-gray-600">Pending Publications</p>
                            <p className="mt-1 text-2xl font-bold text-yellow-600">{stats?.pending_publications || 0}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                            <p className="text-sm text-gray-600">Schools & Teachers</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {(stats?.total_schools || 0) + (stats?.total_teachers || 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
