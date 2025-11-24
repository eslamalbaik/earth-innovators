import { Head } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import AboutSection from '../Components/About/AboutSection';
import AchievementsSection from '../Components/About/AchievementsSection';
import VisionGoalsSection from '../Components/About/VisionGoalsSection';
import ContactSection from '../Components/About/ContactSection';

export default function About({ auth }) {
    return (
        <MainLayout auth={auth}>
            <Head title="من نحن - إرث المبتكرين" />

            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AboutSection />
                </div>
            </section>

            <section className="py-16 bg-green-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AchievementsSection />
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <VisionGoalsSection />
                </div>
            </section>

            <section className="py-16 bg-gradient-to-r from-legacy-green/20 to-legacy-blue/20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ContactSection />
                </div>
            </section>
        </MainLayout>
    );
}
