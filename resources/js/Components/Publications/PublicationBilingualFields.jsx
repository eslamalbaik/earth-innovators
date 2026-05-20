import { useState } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TiptapEditor from '@/Components/TiptapEditor';
import { useTranslation } from '@/i18n';

export default function PublicationBilingualFields({
    data,
    setData,
    errors = {},
    focusRingClass = 'focus:border-[#A3C042] focus:ring-[#A3C042]',
    textareaClassName = 'block w-full rounded-md border-gray-300 shadow-sm',
}) {
    const { t } = useTranslation();
    const [contentLocale, setContentLocale] = useState('ar');

    const textareaClasses = `${textareaClassName} ${focusRingClass}`;

    const tabClass = (locale) =>
        `px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition ${
            contentLocale === locale
                ? 'border-[#A3C042] text-[#A3C042] bg-[#A3C042]/10'
                : 'border-transparent text-gray-500 hover:text-gray-700'
        }`;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-1 border-b border-gray-200">
                <button type="button" className={tabClass('ar')} onClick={() => setContentLocale('ar')}>
                    {t('publicationForm.localeAr')}
                </button>
                <button type="button" className={tabClass('en')} onClick={() => setContentLocale('en')}>
                    {t('publicationForm.localeEn')}
                </button>
            </div>

            {contentLocale === 'ar' ? (
                <div className="space-y-6" dir="rtl">
                    <div>
                        <InputLabel htmlFor="title_ar" value={t('publicationForm.titleArLabel')} />
                        <TextInput
                            id="title_ar"
                            type="text"
                            value={data.title_ar ?? ''}
                            onChange={(e) => setData('title_ar', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder={t('publicationForm.titleArPlaceholder')}
                            required
                        />
                        <InputError message={errors.title_ar} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="description_ar" value={t('publicationForm.descriptionArLabel')} />
                        <textarea
                            id="description_ar"
                            value={data.description_ar ?? ''}
                            onChange={(e) => setData('description_ar', e.target.value)}
                            rows={4}
                            className={`mt-1 ${textareaClasses}`}
                            placeholder={t('publicationForm.descriptionArPlaceholder')}
                        />
                        <InputError message={errors.description_ar} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="content_ar" value={t('publicationForm.contentArLabel')} />
                        <div className="mt-1">
                            <TiptapEditor
                                key="content-ar"
                                content={data.content_ar ?? ''}
                                onChange={(html) => setData('content_ar', html)}
                                placeholder={t('publicationForm.contentArPlaceholder')}
                            />
                        </div>
                        <InputError message={errors.content_ar} className="mt-2" />
                    </div>
                </div>
            ) : (
                <div className="space-y-6" dir="ltr">
                    <div>
                        <InputLabel htmlFor="title" value={t('publicationForm.titleEnLabel')} />
                        <TextInput
                            id="title"
                            type="text"
                            value={data.title ?? ''}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder={t('publicationForm.titleEnPlaceholder')}
                            required
                        />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value={t('publicationForm.descriptionEnLabel')} />
                        <textarea
                            id="description"
                            value={data.description ?? ''}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                            className={`mt-1 ${textareaClasses}`}
                            placeholder={t('publicationForm.descriptionEnPlaceholder')}
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="content" value={t('publicationForm.contentEnLabel')} />
                        <div className="mt-1">
                            <TiptapEditor
                                key="content-en"
                                content={data.content ?? ''}
                                onChange={(html) => setData('content', html)}
                                placeholder={t('publicationForm.contentEnPlaceholder')}
                            />
                        </div>
                        <InputError message={errors.content} className="mt-2" />
                    </div>
                </div>
            )}
        </div>
    );
}

export function publicationBilingualFormIsValid(data) {
    const hasText = (value) => typeof value === 'string' && value.replace(/<[^>]*>/g, '').trim().length > 0;

    return (
        hasText(data.title)
        && hasText(data.title_ar)
        && hasText(data.content)
        && hasText(data.content_ar)
    );
}
