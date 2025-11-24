export default function TeacherRecruitemstSection({
    title = "هل أنت معلم أو مشرف؟",
    callToAction = "انضم إلى إرث المبتكرين!",
    description = "شارك في بناء مجتمع المبتكرين. قيّم مشاريع الطلاب، شارك في التحديات، ونشر المقالات التعليمية لتكون جزءاً من حركة الإبداع.",
    buttonText = "انضم كمعلم/مشرف",
    imageSrc = "/images/avatar2.svg",
    imageAlt = "معلم خصوصي",
    onJoinClick
}) {
    return (
        <section className="py-16 bg-gradient-to-r from-legacy-green to-legacy-blue">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-right">
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {title}
                            </h2>

                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                                {callToAction}
                            </h3>

                            <p className="text-md text-gray-900 leading-relaxed mb-8">
                                {description}
                            </p>

                            <button
                                onClick={onJoinClick}
                                className="bg-legacy-green hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg"
                            >
                                {buttonText}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                        <div className="relative">
                            <img
                                src={imageSrc}
                                alt={imageAlt}
                                className="w-full max-w-md h-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
