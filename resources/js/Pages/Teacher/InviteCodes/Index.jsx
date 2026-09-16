import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InviteCodesPanel from '@/Components/InviteCodes/InviteCodesPanel';

export default function TeacherInviteCodesIndex({ auth, codes }) {
    return (
        <DashboardLayout auth={auth}>
            <Head title="أكواد دعوة الطلاب" />
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-black text-gray-900 mb-1">أكواد دعوة طلابي</h1>
                <p className="text-sm text-gray-600 mb-6">
                    شارك هذا الكود أو الرابط مع طلاب شعبتك لينضموا مباشرة تحت إشرافك دون اختيار مدرسة من قائمة عامة.
                </p>
                <InviteCodesPanel codes={codes} storeRoute="teacher.invite-codes.store" destroyRoute="teacher.invite-codes.destroy" allowedRoles={['student']} />
            </div>
        </DashboardLayout>
    );
}
