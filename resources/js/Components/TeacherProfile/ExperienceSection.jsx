import { FaCalendarAlt } from 'react-icons/fa';

export default function ExperienceSection({ experiences }) {
    return (
        <div className="py-4 px-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">الخبرات</h2>

            <div className="space-y-5">
                {experiences.map((experience) => (
                    <div key={experience.id} className="flex gap-3">
                        <div className="w-1 bg-yellow-400 rounded-full self-stretch"></div>
                        <div className="flex-1">
                            <h3 className="text-md font-semibold text-gray-900 mb-2">
                                {experience.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <FaCalendarAlt className="text-gray-400" />
                                <p>{experience.duration}</p>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                {experience.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
