import { FaCertificate } from 'react-icons/fa';

export default function CertificationsSection({ certifications }) {
    return (
        <div className="py-4 px-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">الشهادات</h2>

            <div className="space-y-5">
                {certifications.map((certification) => (
                    <div key={certification.id} className="flex gap-3">
                        <div className="w-1 bg-yellow-400 rounded-full self-stretch"></div>
                        <div className="flex-1">
                            <h3 className="text-md font-semibold text-gray-900 mb-2">
                                {certification.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {certification.issuer} ({certification.year})
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
