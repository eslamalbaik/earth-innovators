import SectionTitle from '../SectionTitle';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function ContactSection() {
    const contactInfo = [
        {
            icon: FaEnvelope,
            text: "info@innovatorslegacy.ae"
        },
        {
            icon: FaPhone,
            text: "+971 4 XXX XXXX"
        },
        {
            icon: FaMapMarkerAlt,
            text: "دبي، الإمارات العربية المتحدة"
        }
    ];

    return (
        <div>
            <SectionTitle
                text="تواصل معنا"
                size="2xl"
                align="right"
                className="pt-0"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {contactInfo.map((contact, index) => (
                    <div key={index} className="p-3 border border-gray-200 flex justify-start items-center gap-3 text-center bg-white shadow-md rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-legacy-green to-legacy-blue rounded-full flex items-center justify-center">
                            <contact.icon className="text-white text-lg" />
                        </div>
                        <p className="text-lg text-gray-800">{contact.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
