import { useMemo, useState } from 'react';
import { FaPlus, FaTrash, FaEye, FaEyeSlash, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { useTranslation } from '@/i18n';

const DEFAULT_DIAL_CODE = '+971';

const getSubjectLabel = (subject, language) => {
    if (language === 'ar') {
        return subject.name_ar || subject.name_en || subject.name || '';
    }

    return subject.name_en || subject.name_ar || subject.name || '';
};

const formatExperienceDuration = (experience, t) => {
    if (!experience?.start_date) {
        return '';
    }

    const endLabel = experience.still_working
        ? t('joinTeacherPage.form.present')
        : experience.end_date || t('common.notAvailable');

    return `${experience.start_date} - ${endLabel}`;
};

export default function JoinTeacherForm({ subjects = [], cities = [] }) {
    const { t, language } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dial_code: DEFAULT_DIAL_CODE,
        city: '',
        password: '',
        password_confirmation: '',
        bio: '',
        profile_image: null,
        subjects: [],
        stages: [],
        price_per_hour: 0,
        certifications: [],
        experiences: [],
    });

    const [certifications, setCertifications] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [newCertification, setNewCertification] = useState({ name: '', issuer: '' });
    const [newExperience, setNewExperience] = useState({
        title: '',
        employer: '',
        startDate: '',
        endDate: '',
        stillWorking: false,
        description: '',
    });

    const dialCodeOptions = useMemo(() => [
        { value: '+971', label: t('joinTeacherPage.form.dialCodes.uae') },
    ], [t]);

    const stageOptions = useMemo(() => [
        { value: '\u0627\u0644\u0627\u0628\u062a\u062f\u0627\u0626\u064a\u0629', label: t('joinTeacherPage.form.stageOptions.primary') },
        { value: '\u0627\u0644\u0645\u062a\u0648\u0633\u0637\u0629', label: t('joinTeacherPage.form.stageOptions.middle') },
        { value: '\u0627\u0644\u062b\u0627\u0646\u0648\u064a\u0629', label: t('joinTeacherPage.form.stageOptions.high') },
    ], [t]);

    const handleInputChange = (event) => {
        const { name, value, type, checked, files } = event.target;

        if (type === 'file') {
            setFormData((prev) => ({
                ...prev,
                [name]: files[0] || null,
            }));
            return;
        }

        if (type === 'checkbox') {
            if (name === 'stages') {
                const updatedStages = checked
                    ? [...formData.stages, value]
                    : formData.stages.filter((stage) => stage !== value);
                setFormData((prev) => ({ ...prev, stages: updatedStages }));
                return;
            }

            if (name === 'subjects') {
                const subjectId = parseInt(value, 10);
                const updatedSubjects = checked
                    ? [...formData.subjects, subjectId]
                    : formData.subjects.filter((id) => id !== subjectId);
                setFormData((prev) => ({ ...prev, subjects: updatedSubjects }));
            }

            return;
        }

        if (name === 'price_per_hour') {
            setFormData((prev) => ({
                ...prev,
                [name]: parseFloat(value) || 0,
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePhoneChange = (event) => {
        const sanitized = event.target.value.replace(/\D/g, '');
        setFormData((prev) => ({ ...prev, phone: sanitized }));
    };

    const handleDialCodeChange = (event) => {
        setFormData((prev) => ({ ...prev, dial_code: event.target.value }));
    };

    const addCertification = () => {
        if (!newCertification.name || !newCertification.issuer) {
            return;
        }

        const certificate = { id: Date.now(), ...newCertification };
        setCertifications((prev) => [...prev, certificate]);
        setFormData((prev) => ({
            ...prev,
            certifications: [...prev.certifications, certificate],
        }));
        setNewCertification({ name: '', issuer: '' });
    };

    const removeCertification = (id) => {
        setCertifications((prev) => prev.filter((certificate) => certificate.id !== id));
        setFormData((prev) => ({
            ...prev,
            certifications: prev.certifications.filter((certificate) => certificate.id !== id),
        }));
    };

    const addExperience = () => {
        if (!newExperience.title || !newExperience.employer || !newExperience.startDate) {
            return;
        }

        const experience = {
            id: Date.now(),
            title: newExperience.title,
            employer: newExperience.employer,
            start_date: newExperience.startDate,
            end_date: newExperience.endDate,
            still_working: newExperience.stillWorking,
            description: newExperience.description,
        };

        setExperiences((prev) => [...prev, experience]);
        setFormData((prev) => ({
            ...prev,
            experiences: [...prev.experiences, experience],
        }));
        setNewExperience({
            title: '',
            employer: '',
            startDate: '',
            endDate: '',
            stillWorking: false,
            description: '',
        });
    };

    const removeExperience = (id) => {
        setExperiences((prev) => prev.filter((experience) => experience.id !== id));
        setFormData((prev) => ({
            ...prev,
            experiences: prev.experiences.filter((experience) => experience.id !== id),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.password) {
            setError(t('joinTeacherPage.form.errors.requiredFields'));
            setLoading(false);
            return;
        }

        if (formData.subjects.length === 0) {
            setError(t('joinTeacherPage.form.errors.selectSubject'));
            setLoading(false);
            return;
        }

        if (formData.stages.length === 0) {
            setError(t('joinTeacherPage.form.errors.selectStage'));
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            let cleanedPhone = String(formData.phone || '').replace(/\D/g, '');

            if (cleanedPhone.startsWith('0')) {
                cleanedPhone = cleanedPhone.substring(1);
            }

            const fullPhone = `${formData.dial_code}${cleanedPhone}`;

            formDataToSend.append('name', formData.name || '');
            formDataToSend.append('email', formData.email || '');
            formDataToSend.append('phone', fullPhone);
            formDataToSend.append('city', formData.city || '');
            formDataToSend.append('password', formData.password || '');
            formDataToSend.append('password_confirmation', formData.password_confirmation || '');

            if (formData.bio) {
                formDataToSend.append('bio', formData.bio);
            }

            if (formData.profile_image) {
                formDataToSend.append('profile_image', formData.profile_image);
            }

            formDataToSend.append('subjects', JSON.stringify(formData.subjects || []));
            formDataToSend.append('stages', JSON.stringify(formData.stages || []));
            formDataToSend.append('price_per_hour', parseFloat(formData.price_per_hour) || 0);

            if (formData.certifications.length > 0) {
                formDataToSend.append('certifications', JSON.stringify(formData.certifications));
            }

            if (formData.experiences.length > 0) {
                formDataToSend.append('experiences', JSON.stringify(formData.experiences));
            }

            const response = await axios.post('/join-teacher', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                if (response.data.redirect) {
                    router.visit(response.data.redirect);
                    return;
                }

                setSuccess(true);
                setTimeout(() => {
                    router.visit('/');
                }, 3000);
            }
        } catch (submitError) {
            if (submitError.response?.data?.errors) {
                const errorMessages = Object.values(submitError.response.data.errors).flat();
                setError(t('joinTeacherPage.form.errors.validationPrefix', { errors: errorMessages.join(', ') }));
            } else if (submitError.response?.data?.message) {
                setError(submitError.response.data.message);
            } else {
                setError(t('joinTeacherPage.form.errors.submitFailed'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-lg">
                <div className="mb-4 text-6xl text-green-500">
                    <FaCheck />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('joinTeacherPage.form.success.title')}</h2>
                <p className="mb-6 text-gray-600">
                    {t('joinTeacherPage.form.success.message')}
                </p>
                <div className="text-sm text-gray-500">
                    {t('joinTeacherPage.form.success.redirecting')}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <FaExclamationTriangle className="text-red-500" />
                    <span className="text-red-700">{error}</span>
                </div>
            )}

            <div className="mb-8">
                <h2 className="mb-6 text-xl font-bold text-gray-900">{t('joinTeacherPage.form.sections.personalInfo')}</h2>

                <div className="mb-6 text-center">
                    <label htmlFor="profile_image" className="cursor-pointer">
                        <div className="mx-auto mb-2 flex h-32 w-32 items-center justify-center rounded-full bg-yellow-100 transition duration-300 hover:bg-yellow-200">
                            {formData.profile_image ? (
                                <img
                                    src={URL.createObjectURL(formData.profile_image)}
                                    alt={t('joinTeacherPage.form.imagePreviewAlt')}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <FaPlus className="text-3xl text-yellow-600" />
                            )}
                        </div>
                        <p className="text-sm text-gray-600">{t('joinTeacherPage.form.fields.profileImage')}</p>
                    </label>
                    <input
                        type="file"
                        id="profile_image"
                        name="profile_image"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('joinTeacherPage.form.fields.fullName')} *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                            placeholder={t('joinTeacherPage.form.placeholders.fullName')}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('joinTeacherPage.form.fields.email')} *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                            placeholder={t('joinTeacherPage.form.placeholders.email')}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('joinTeacherPage.form.fields.phone')} *</label>
                        <div className="flex gap-2">
                            <select
                                value={formData.dial_code}
                                onChange={handleDialCodeChange}
                                className="w-1/3 rounded-lg border border-gray-300 bg-gray-50 px-3 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                                required
                            >
                                {dialCodeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                                placeholder={t('joinTeacherPage.form.placeholders.phone')}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('joinTeacherPage.form.fields.city')} *</label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                            required
                        >
                            <option value="">{t('joinTeacherPage.form.placeholders.selectCity')}</option>
                            {cities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('joinTeacherPage.form.fields.password')} *</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 pe-12 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('joinTeacherPage.form.fields.passwordConfirmation')} *</label>
                        <div className="relative">
                            <input
                                type={showPasswordConfirm ? 'text' : 'password'}
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 pe-12 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswordConfirm((prev) => !prev)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                            >
                                {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('joinTeacherPage.form.fields.bio')}</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                            placeholder={t('joinTeacherPage.form.placeholders.bio')}
                        />
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="mb-6 text-xl font-bold text-gray-900">{t('joinTeacherPage.form.sections.certifications')}</h2>

                {certifications.map((certificate) => (
                    <div key={certificate.id} className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-gray-800">{certificate.name} - {certificate.issuer}</p>
                        <button
                            type="button"
                            onClick={() => removeCertification(certificate.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                        type="text"
                        placeholder={t('joinTeacherPage.form.placeholders.certificateName')}
                        value={newCertification.name}
                        onChange={(event) => setNewCertification({ ...newCertification, name: event.target.value })}
                        className="rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                    />
                    <input
                        type="text"
                        placeholder={t('joinTeacherPage.form.placeholders.certificateIssuer')}
                        value={newCertification.issuer}
                        onChange={(event) => setNewCertification({ ...newCertification, issuer: event.target.value })}
                        className="rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                    />
                </div>
                <button
                    type="button"
                    onClick={addCertification}
                    disabled={!newCertification.name || !newCertification.issuer}
                    className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-yellow-900 shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-yellow-500 hover:text-yellow-950 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-yellow-200 disabled:text-yellow-700 disabled:shadow-none"
                >
                    <FaPlus />
                    {t('joinTeacherPage.form.actions.add')}
                </button>
            </div>

            <div className="mb-8">
                <h2 className="mb-6 text-xl font-bold text-gray-900">{t('joinTeacherPage.form.sections.experiences')}</h2>

                {experiences.map((experience) => (
                    <div key={experience.id} className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">{experience.title}</h3>
                                <p className="text-sm text-gray-600">{formatExperienceDuration(experience, t)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeExperience(experience.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <FaTrash />
                            </button>
                        </div>
                        {experience.description ? (
                            <p className="text-gray-700">{experience.description}</p>
                        ) : null}
                    </div>
                ))}

                <div className="mb-4 space-y-4">
                    <input
                        type="text"
                        placeholder={t('joinTeacherPage.form.placeholders.experienceTitle')}
                        value={newExperience.title}
                        onChange={(event) => setNewExperience({ ...newExperience, title: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                    />
                    <input
                        type="text"
                        placeholder={t('joinTeacherPage.form.placeholders.experienceEmployer')}
                        value={newExperience.employer}
                        onChange={(event) => setNewExperience({ ...newExperience, employer: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                    />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input
                            type="date"
                            value={newExperience.startDate}
                            onChange={(event) => setNewExperience({ ...newExperience, startDate: event.target.value })}
                            className="rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                        />
                        <input
                            type="date"
                            value={newExperience.endDate}
                            onChange={(event) => setNewExperience({ ...newExperience, endDate: event.target.value })}
                            disabled={newExperience.stillWorking}
                            className="rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={newExperience.stillWorking}
                            onChange={(event) => setNewExperience({ ...newExperience, stillWorking: event.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        />
                        <span className="text-sm text-gray-700">{t('joinTeacherPage.form.fields.stillWorking')}</span>
                    </label>
                    <textarea
                        placeholder={t('joinTeacherPage.form.placeholders.experienceDescription')}
                        value={newExperience.description}
                        onChange={(event) => setNewExperience({ ...newExperience, description: event.target.value })}
                        rows="3"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                    />
                </div>
                <button
                    type="button"
                    onClick={addExperience}
                    disabled={!newExperience.title || !newExperience.employer || !newExperience.startDate}
                    className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-yellow-900 shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-yellow-500 hover:text-yellow-950 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-yellow-200 disabled:text-yellow-700 disabled:shadow-none"
                >
                    <FaPlus />
                    {t('joinTeacherPage.form.actions.addExperience')}
                </button>
            </div>

            <div className="mb-8">
                <h2 className="mb-6 text-xl font-bold text-gray-900">{t('joinTeacherPage.form.sections.teachingPreferences')}</h2>

                <div className="mb-6">
                    <p className="mb-3 text-sm font-medium text-gray-700">{t('joinTeacherPage.form.fields.stagesLabel')}</p>
                    <div className="flex flex-wrap gap-4">
                        {stageOptions.map((stage) => (
                            <label key={stage.value} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="stages"
                                    value={stage.value}
                                    checked={formData.stages.includes(stage.value)}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                                />
                                <span className="text-gray-700">{stage.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <p className="mb-3 text-sm font-medium text-gray-700">{t('joinTeacherPage.form.fields.subjectsLabel')}</p>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {subjects.map((subject) => (
                            <label key={subject.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="subjects"
                                    value={subject.id}
                                    checked={formData.subjects.includes(subject.id)}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                                />
                                <span className="text-gray-700">{getSubjectLabel(subject, language)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('joinTeacherPage.form.fields.hourlyRate')} *</label>
                    <input
                        type="number"
                        name="price_per_hour"
                        value={formData.price_per_hour}
                        onChange={handleInputChange}
                        placeholder={t('joinTeacherPage.form.placeholders.hourlyRate')}
                        min="1"
                        step="0.01"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                        required
                    />
                    <p className="mt-1 text-sm text-gray-500">{t('joinTeacherPage.form.fields.hourlyRateHint')}</p>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-yellow-400 px-8 py-3 text-md font-bold text-black transition duration-300 hover:scale-105 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            {t('joinTeacherPage.form.actions.submitting')}
                        </>
                    ) : (
                        t('joinTeacherPage.form.actions.submit')
                    )}
                </button>
            </div>
        </form>
    );
}
