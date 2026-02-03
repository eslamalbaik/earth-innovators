import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaCreditCard, FaToggleOn, FaToggleOff, FaSave, FaSpinner, FaCheckCircle, FaTimesCircle, FaEdit, FaPlug } from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function AdminPaymentGatewaysIndex({ gateways }) {
    const { confirm } = useConfirmDialog();
    const [editingGateway, setEditingGateway] = useState(null);
    const [testingGateway, setTestingGateway] = useState(null);

    const handleToggleStatus = async (gateway) => {
        const confirmed = await confirm({
            title: gateway.is_enabled ? 'إلغاء تفعيل بوابة الدفع' : 'تفعيل بوابة الدفع',
            message: `هل أنت متأكد من ${gateway.is_enabled ? 'إلغاء تفعيل' : 'تفعيل'} بوابة الدفع "${gateway.display_name_ar}"؟`,
            confirmText: gateway.is_enabled ? 'إلغاء التفعيل' : 'تفعيل',
            cancelText: 'إلغاء',
            variant: gateway.is_enabled ? 'warning' : 'success',
        });

        if (confirmed) {
            router.post(route('admin.payment-gateways.toggle-status', gateway.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleTestConnection = async (gateway) => {
        setTestingGateway(gateway.id);
        try {
            const response = await fetch(route('admin.payment-gateways.test-connection', gateway.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });
            const data = await response.json();

            if (data.success) {
                alert('✓ ' + data.message);
            } else {
                alert('✗ ' + data.message);
            }
        } catch (error) {
            alert('حدث خطأ أثناء اختبار الاتصال');
        } finally {
            setTestingGateway(null);
        }
    };

    const GatewayForm = ({ gateway }) => {
        const { data, setData, put, processing, errors, reset } = useForm({
            display_name: gateway.display_name || '',
            display_name_ar: gateway.display_name_ar || '',
            is_enabled: gateway.is_enabled || false,
            is_test_mode: gateway.is_test_mode ?? true,
            api_key: gateway.api_key || '',
            api_secret: gateway.api_secret || '',
            public_key: gateway.public_key || '',
            webhook_secret: gateway.webhook_secret || '',
            base_url: gateway.base_url || '',
            description: gateway.description || '',
            description_ar: gateway.description_ar || '',
            sort_order: gateway.sort_order || 0,
        });

        const submit = (e) => {
            e.preventDefault();
            put(route('admin.payment-gateways.update', gateway.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingGateway(null);
                },
            });
        };

        const cancel = () => {
            reset();
            setEditingGateway(null);
        };

        return (
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الاسم المعروض (إنجليزي) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.display_name}
                            onChange={(e) => setData('display_name', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.display_name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            required
                        />
                        {errors.display_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الاسم المعروض (عربي) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.display_name_ar}
                            onChange={(e) => setData('display_name_ar', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.display_name_ar ? 'border-red-500' : 'border-gray-300'
                                }`}
                            required
                        />
                        {errors.display_name_ar && (
                            <p className="mt-1 text-sm text-red-600">{errors.display_name_ar}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key
                        </label>
                        <input
                            type="password"
                            value={data.api_key}
                            onChange={(e) => setData('api_key', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.api_key ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="أدخل API Key"
                        />
                        {errors.api_key && (
                            <p className="mt-1 text-sm text-red-600">{errors.api_key}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Secret
                        </label>
                        <input
                            type="password"
                            value={data.api_secret}
                            onChange={(e) => setData('api_secret', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.api_secret ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="أدخل API Secret"
                        />
                        {errors.api_secret && (
                            <p className="mt-1 text-sm text-red-600">{errors.api_secret}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Public Key
                        </label>
                        <input
                            type="password"
                            value={data.public_key}
                            onChange={(e) => setData('public_key', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.public_key ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="أدخل Public Key"
                        />
                        {errors.public_key && (
                            <p className="mt-1 text-sm text-red-600">{errors.public_key}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook Secret
                        </label>
                        <input
                            type="password"
                            value={data.webhook_secret}
                            onChange={(e) => setData('webhook_secret', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.webhook_secret ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="أدخل Webhook Secret"
                        />
                        {errors.webhook_secret && (
                            <p className="mt-1 text-sm text-red-600">{errors.webhook_secret}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Base URL
                        </label>
                        <input
                            type="url"
                            value={data.base_url}
                            onChange={(e) => setData('base_url', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.base_url ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="https://api.example.com"
                        />
                        {errors.base_url && (
                            <p className="mt-1 text-sm text-red-600">{errors.base_url}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ترتيب العرض
                        </label>
                        <input
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.sort_order ? 'border-red-500' : 'border-gray-300'
                                }`}
                            min="0"
                        />
                        {errors.sort_order && (
                            <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الوصف (إنجليزي)
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الوصف (عربي)
                        </label>
                        <textarea
                            value={data.description_ar}
                            onChange={(e) => setData('description_ar', e.target.value)}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description_ar ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id={`enabled_${gateway.id}`}
                            checked={data.is_enabled}
                            onChange={(e) => setData('is_enabled', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`enabled_${gateway.id}`} className="mr-2 block text-sm text-gray-900">
                            مفعّل
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id={`test_mode_${gateway.id}`}
                            checked={data.is_test_mode}
                            onChange={(e) => setData('is_test_mode', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`test_mode_${gateway.id}`} className="mr-2 block text-sm text-gray-900">
                            وضع الاختبار
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={cancel}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <FaSave />
                                حفظ
                            </>
                        )}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <DashboardLayout header="إعدادات بوابات الدفع">
            <Head title="إعدادات بوابات الدفع" />

            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">بوابات الدفع المتاحة</h2>
                        <div className="text-sm text-gray-600">
                            إجمالي البوابات: {gateways.length}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {gateways.map((gateway) => (
                            <div
                                key={gateway.id}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                {editingGateway === gateway.id ? (
                                    <GatewayForm gateway={gateway} />
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg ${gateway.is_enabled ? 'bg-green-100' : 'bg-gray-100'
                                                    }`}>
                                                    <FaCreditCard className={`text-2xl ${gateway.is_enabled ? 'text-green-600' : 'text-gray-400'
                                                        }`} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {gateway.display_name_ar} ({gateway.display_name})
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {gateway.description_ar || gateway.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${gateway.is_enabled
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {gateway.is_enabled ? 'مفعّل' : 'غير مفعّل'}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${gateway.is_test_mode
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {gateway.is_test_mode ? 'وضع الاختبار' : 'وضع الإنتاج'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleTestConnection(gateway)}
                                                    disabled={testingGateway === gateway.id}
                                                    className="px-4 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                                                    title="اختبار الاتصال"
                                                >
                                                    {testingGateway === gateway.id ? (
                                                        <FaSpinner className="animate-spin" />
                                                    ) : (
                                                        <FaPlug />
                                                    )}
                                                    اختبار
                                                </button>
                                                <button
                                                    onClick={() => setEditingGateway(gateway.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="تعديل"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(gateway)}
                                                    className={`p-2 rounded-lg ${gateway.is_enabled
                                                            ? 'text-yellow-600 hover:bg-yellow-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={gateway.is_enabled ? 'إلغاء التفعيل' : 'تفعيل'}
                                                >
                                                    {gateway.is_enabled ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                                                </button>
                                            </div>
                                        </div>

                                        {gateway.api_key && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">
                                                    <strong>API Key:</strong> {gateway.api_key.substring(0, 10)}...
                                                </p>
                                                {gateway.base_url && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <strong>Base URL:</strong> {gateway.base_url}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {gateways.length === 0 && (
                        <div className="text-center py-12">
                            <FaCreditCard className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">لا توجد بوابات دفع متاحة</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

