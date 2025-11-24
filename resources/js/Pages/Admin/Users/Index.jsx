import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function UsersIndex({ users, filters, auth }) {
    const [search, setSearch] = useState(filters.search || '');

    const updateRole = (id, role) => {
        router.post(route('admin.users.update-role', id), { role, _method: 'put' });
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="إدارة المستخدمين" />
            <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold">إدارة المستخدمين</h1>
                    <div>
                        <input className="border rounded px-3 py-2" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="بحث" />
                        <button className="ml-2 px-4 py-2 bg-yellow-600 text-white rounded" onClick={()=>router.get(route('admin.users.index'),{search},{preserveState:true,replace:true})}>بحث</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">ID</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Name</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Email</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Role</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.data.map(u => (
                                <tr key={u.id}>
                                    <td className="px-4 py-2 text-sm">#{u.id}</td>
                                    <td className="px-4 py-2 text-sm">{u.name}</td>
                                    <td className="px-4 py-2 text-sm">{u.email}</td>
                                    <td className="px-4 py-2 text-sm">{u.role}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <div className="flex gap-2">
                                            {['admin','teacher','student'].map(r => (
                                                <button key={r} className={`px-3 py-1 rounded ${u.role===r?'bg-green-600 text-white':'bg-gray-200'}`} onClick={()=>updateRole(u.id,r)}>
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}


