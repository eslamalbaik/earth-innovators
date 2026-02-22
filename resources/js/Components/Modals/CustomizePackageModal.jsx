import { useState } from 'react';
import Modal from '../Modal';
import { FaTimes } from 'react-icons/fa';
import PrimaryButton from '../PrimaryButton';
import { useTranslation } from '@/i18n';

export default function CustomizePackageModal({ onClose }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        school_name: '',
        responsible_name: '',
        mobile_number: '',
        expected_students: '',
        additional_notes: '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const axios = window.axios || (await import('axios')).default;
            const url = '/api/customize-package-request';

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            if (response.data.success) {
                alert(t('packages.requestSuccess'));
                setFormData({
                    school_name: '',
                    responsible_name: '',
                    mobile_number: '',
                    expected_students: '',
                    additional_notes: '',
                });
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert(t('packages.requestError'));
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Modal show={true} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 text-center">
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition duration-300 float-left"
                        >
                            <FaTimes className="text-2xl" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {t('packages.customQuoteRequest')}
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('packages.schoolName')}
                            </label>
                            <input
                                type="text"
                                name="school_name"
                                value={formData.school_name}
                                onChange={handleChange}
                                dir="rtl"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent "
                                placeholder={t('packages.enterSchoolName')}
                            />
                            {errors.school_name && (
                                <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.school_name) ? errors.school_name[0] : errors.school_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('packages.responsibleName')}
                            </label>
                            <input
                                type="text"
                                name="responsible_name"
                                value={formData.responsible_name}
                                onChange={handleChange}
                                dir="rtl"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent "
                                placeholder={t('packages.enterResponsibleName')}
                            />
                            {errors.responsible_name && (
                                <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.responsible_name) ? errors.responsible_name[0] : errors.responsible_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('packages.phoneNumber')}
                            </label>
                            <input
                                type="tel"
                                name="mobile_number"
                                value={formData.mobile_number}
                                onChange={handleChange}
                                dir="rtl"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent "
                                placeholder="+971 5x xxxx xxxx"
                            />
                            {errors.mobile_number && (
                                <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.mobile_number) ? errors.mobile_number[0] : errors.mobile_number}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('packages.expectedStudents')}
                            </label>
                            <input
                                type="number"
                                name="expected_students"
                                value={formData.expected_students}
                                onChange={handleChange}
                                dir="rtl"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent "
                                placeholder={t('packages.enterExpectedNumber')}
                                min="1"
                            />
                            {errors.expected_students && (
                                <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.expected_students) ? errors.expected_students[0] : errors.expected_students}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('packages.additionalNotes')}
                        </label>
                        <textarea
                            name="additional_notes"
                            value={formData.additional_notes}
                            onChange={handleChange}
                            dir="rtl"
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent "
                            placeholder={t('packages.enterAdditionalNotes')}
                        />
                        {errors.additional_notes && (
                            <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.additional_notes) ? errors.additional_notes[0] : errors.additional_notes}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            {t('common.cancel')}
                        </button>
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 bg-[#A3C042] text-white rounded-lg font-semibold hover:shadow-lg transition"
                        >
                            {processing ? t('common.sending') : t('packages.confirmQuoteRequest')}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

