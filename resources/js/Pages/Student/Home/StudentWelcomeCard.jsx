export default function StudentWelcomeCard({ userName, onUploadProject }) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-center">
                <div className="text-sm font-bold text-gray-900">مرحباً {userName ? `بك، ${userName}` : 'بك'} في إرث المبتكرين</div>
                <div className="mt-1 text-xs text-gray-500">
                    طور مهاراتك الإبداعية، ارفع مشاريعك وتفاعل مع مجتمع من المبدعين
                </div>
                <button
                    type="button"
                    onClick={onUploadProject}
                    className="mt-3 inline-flex items-center justify-center rounded-xl bg-[#A3C042] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8CA635] transition w-40"
                >
                    رفع مشروع جديد
                </button>
            </div>
        </section>
    );
}


