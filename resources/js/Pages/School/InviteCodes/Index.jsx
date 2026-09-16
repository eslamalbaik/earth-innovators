import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InviteCodesPanel from '@/Components/InviteCodes/InviteCodesPanel';

export default function SchoolInviteCodesIndex({ auth, codes }) {
    return (
        <DashboardLayout auth={auth}>
            <Head title="أكواد الدعوة" />
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-black text-gray-900 mb-1">أكواد دعوة المعلمين والطلاب</h1>
                <p className="text-sm text-gray-600 mb-6">
                    شارك هذا الكود أو الرابط مع معلم أو طالب لينضم مباشرة لمدرستك دون اختيار مدرسة من قائمة عامة —
                    يمنع انضمام حسابات غير مصرح بها.
                </p>
                <InviteCodesPanel codes={codes} storeRoute="school.invite-codes.store" destroyRoute="school.invite-codes.destroy" allowedRoles={['student', 'teacher']} />
            </div>
        </DashboardLayout>
    );
}
