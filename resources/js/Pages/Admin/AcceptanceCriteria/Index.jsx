import DashboardLayout from '@/Layouts/DashboardLayout';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaInfoCircle, FaSave, FaTimes } from 'react-icons/fa';

export default function AcceptanceCriteriaIndex({ criteria = [], totalWeight = 0, projects = [], selectedProjectId = null }) {
    const { confirm } = useConfirmDialog();
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const { data: formData, setData: setFormData, post: submitForm, put: updateForm, processing, errors, reset } = useForm({
        project_id: selectedProjectId || '',
        name_ar: '',
        description_ar: '',
        weight: 0,
        order: 0,
        is_active: true,
    });

    const { data: editData, setData: setEditData, put: updateEdit, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        project_id: null,
        name_ar: '',
        description_ar: '',
        weight: 0,
        order: 0,
        is_active: true,
    });

    const handleAdd = (e) => {
        e.preventDefault();

        // التحقق من أن الوزن لا يتجاوز الحد المسموح
        const maxAllowed = getMaxAllowedWeightForAdd(formData.project_id || null);
        if (parseFloat(formData.weight) > maxAllowed) {
            alert(`الوزن المدخل (${formData.weight}%) يتجاوز الحد الأقصى المسموح (${maxAllowed.toFixed(2)}%)`);
            return;
        }

        // التحقق من أن مجموع الأوزان لا يتجاوز 100%
        const currentTotal = formData.project_id
            ? getTotalWeightForProject(formData.project_id)
            : criteria.filter(c => !c.project_id).reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
        const newTotal = currentTotal + parseFloat(formData.weight);

        if (newTotal > 100) {
            alert(`مجموع الأوزان سيكون ${newTotal.toFixed(2)}% وهو أكبر من 100%. الحد الأقصى المسموح: ${maxAllowed.toFixed(2)}%`);
            return;
        }

        submitForm(route('admin.acceptance-criteria.store'), {
            onSuccess: () => {
                reset();
                setShowAddForm(false);
            },
        });
    };

    const handleEdit = (criterion) => {
        setEditingId(criterion.id);
        setEditData({
            project_id: criterion.project_id || '',
            name_ar: criterion.name_ar,
            description_ar: criterion.description_ar || '',
            weight: criterion.weight,
            order: criterion.order,
            is_active: criterion.is_active,
        });
    };

    const handleUpdate = (id) => {
        // التحقق من أن الوزن لا يتجاوز الحد المسموح
        const maxAllowed = getMaxAllowedWeight(id, editData.project_id || null);
        if (parseFloat(editData.weight) > maxAllowed) {
            alert(`الوزن المدخل (${editData.weight}%) يتجاوز الحد الأقصى المسموح (${maxAllowed.toFixed(2)}%)`);
            return;
        }

        // التحقق من أن مجموع الأوزان لا يتجاوز 100%
        const currentTotal = getTotalWeightExcludingCurrent(id, editData.project_id || null);
        const newTotal = currentTotal + parseFloat(editData.weight);

        if (newTotal > 100) {
            alert(`مجموع الأوزان سيكون ${newTotal.toFixed(2)}% وهو أكبر من 100%. الحد الأقصى المسموح: ${maxAllowed.toFixed(2)}%`);
            return;
        }

        updateEdit(route('admin.acceptance-criteria.update', id), {
            onSuccess: () => {
                setEditingId(null);
                resetEdit();
            },
        });
    };

    const handleDelete = async (id, criterionName) => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: `هل أنت متأكد من حذف المعيار "${criterionName}"؟`,
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.acceptance-criteria.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleWeightChange = (id, newWeight) => {
        const criterion = criteria.find(c => c.id === id);
        if (criterion) {
            let weightValue = parseFloat(newWeight) || 0;
            // منع الوزن من تجاوز 100%
            if (weightValue > 100) {
                weightValue = 100;
            }
            if (weightValue < 0) {
                weightValue = 0;
            }
            setEditData({
                ...editData,
                weight: weightValue,
            });
        }
    };

    const handleAddWeightChange = (newWeight) => {
        let weightValue = parseFloat(newWeight) || 0;
        // منع الوزن من تجاوز 100%
        if (weightValue > 100) {
            weightValue = 100;
        }
        if (weightValue < 0) {
            weightValue = 0;
        }
        setFormData('weight', weightValue);
    };

    const getTotalWeightExcludingCurrent = (currentId, projectId) => {
        return criteria
            .filter(c => c.id !== currentId && editingId !== c.id && c.project_id === projectId)
            .reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
    };

    const getTotalWeightForProject = (projectId) => {
        return criteria
            .filter(c => c.project_id === projectId)
            .reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
    };

    const getMaxAllowedWeight = (currentId, projectId) => {
        const currentTotal = getTotalWeightExcludingCurrent(currentId, projectId);
        return Math.max(0, 100 - currentTotal);
    };

    const getMaxAllowedWeightForAdd = (projectId) => {
        const currentTotal = projectId
            ? getTotalWeightForProject(projectId)
            : criteria
                .filter(c => !c.project_id)
                .reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
        return Math.max(0, 100 - currentTotal);
    };

    const handleProjectChange = (projectId) => {
        router.get(route('admin.acceptance-criteria.index'), { project_id: projectId || null }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout header="معايير القبول">
            <Head title="معايير القبول" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">معايير القبول</h1>
                        <p className="text-gray-600 mt-2">تخصيص معايير القبول للمشاريع</p>
                    </div>
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2"
                        >
                            <FaPlus />
                            إضافة معيار جديد
                        </button>
                    )}
                </div>

                {/* Project Filter */}
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر المشروع
                    </label>
                    <select
                        value={selectedProjectId || ''}
                        onChange={(e) => handleProjectChange(e.target.value || null)}
                        className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">جميع المعايير (عام)</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.title}
                            </option>
                        ))}
                    </select>
                    {selectedProjectId && (
                        <p className="mt-2 text-sm text-gray-600">
                            عرض معايير المشروع: {projects.find(p => p.id == selectedProjectId)?.title}
                        </p>
                    )}
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">إضافة معيار جديد</h2>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    reset();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المشروع (اختياري - اتركه فارغاً للمعايير العامة)
                                </label>
                                <select
                                    value={formData.project_id || ''}
                                    onChange={(e) => setFormData('project_id', e.target.value || null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">معايير عامة</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم المعيار <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData('name_ar', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.name_ar ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    required
                                />
                                {errors.name_ar && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name_ar}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوصف
                                </label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData('description_ar', e.target.value)}
                                    rows={3}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.description_ar ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوزن (%) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max={getMaxAllowedWeightForAdd(formData.project_id || null)}
                                    step="0.01"
                                    value={formData.weight}
                                    onChange={(e) => handleAddWeightChange(e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.weight ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    required
                                />
                                {errors.weight && (
                                    <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    الحد الأقصى المسموح: {getMaxAllowedWeightForAdd(formData.project_id || null).toFixed(2)}%
                                    {formData.project_id ? (
                                        <span className="block mt-1">
                                            المجموع الحالي للمشروع: {getTotalWeightForProject(formData.project_id).toFixed(2)}%
                                        </span>
                                    ) : (
                                        <span className="block mt-1">
                                            المجموع الحالي للمعايير العامة: {criteria.filter(c => !c.project_id).reduce((sum, c) => sum + parseFloat(c.weight || 0), 0).toFixed(2)}%
                                        </span>
                                    )}
                                </p>
                                {parseFloat(formData.weight) + (formData.project_id ? getTotalWeightForProject(formData.project_id) : criteria.filter(c => !c.project_id).reduce((sum, c) => sum + parseFloat(c.weight || 0), 0)) > 100 && (
                                    <p className="mt-1 text-sm text-red-600 font-semibold">
                                        ⚠️ تحذير: مجموع الأوزان سيتجاوز 100%!
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaSave />
                                    {processing ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        reset();
                                    }}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg flex items-center gap-2"
                                >
                                    <FaTimes />
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Criteria List */}
                <div className="space-y-4">
                    {criteria.map((criterion) => (
                        <div
                            key={criterion.id}
                            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                        >
                            {editingId === criterion.id ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-gray-900">تعديل المعيار</h3>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                resetEdit();
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                المشروع (اختياري)
                                            </label>
                                            <select
                                                value={editData.project_id || ''}
                                                onChange={(e) => setEditData('project_id', e.target.value || null)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">معايير عامة</option>
                                                {projects.map((project) => (
                                                    <option key={project.id} value={project.id}>
                                                        {project.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    اسم المعيار
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editData.name_ar}
                                                    onChange={(e) => setEditData('name_ar', e.target.value)}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${editErrors.name_ar ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    الوزن (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={getMaxAllowedWeight(criterion.id, editData.project_id || null)}
                                                    step="0.01"
                                                    value={editData.weight}
                                                    onChange={(e) => handleWeightChange(criterion.id, e.target.value)}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${editErrors.weight ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    المجموع الحالي (بدون هذا المعيار): {getTotalWeightExcludingCurrent(criterion.id, editData.project_id || null).toFixed(2)}%
                                                </p>
                                                <p className="mt-1 text-xs text-blue-600">
                                                    الحد الأقصى المسموح: {getMaxAllowedWeight(criterion.id, editData.project_id || null).toFixed(2)}%
                                                </p>
                                                {parseFloat(editData.weight) + getTotalWeightExcludingCurrent(criterion.id, editData.project_id || null) > 100 && (
                                                    <p className="mt-1 text-sm text-red-600 font-semibold">
                                                        ⚠️ تحذير: مجموع الأوزان سيتجاوز 100%!
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الوصف
                                        </label>
                                        <textarea
                                            value={editData.description_ar}
                                            onChange={(e) => setEditData('description_ar', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleUpdate(criterion.id)}
                                            disabled={editProcessing}
                                            className="bg-[#A3C042] hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <FaSave />
                                            {editProcessing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                resetEdit();
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg flex items-center gap-2"
                                        >
                                            <FaTimes />
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    {/* Weight */}
                                    <div className="text-4xl font-bold text-gray-900 min-w-[100px] text-left">
                                        {parseFloat(criterion.weight || 0).toFixed(0)}%
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {criterion.project_title || 'عام'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {criterion.name_ar}
                                        </h3>
                                        {criterion.description_ar && (
                                            <p className="text-gray-600">{criterion.description_ar}</p>
                                        )}
                                    </div>

                                    {/* Slider */}
                                    <div className="flex items-center gap-4 min-w-[200px]">
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-3 relative">
                                                <div
                                                    className="bg-[#A3C042] h-3 rounded-full transition-all"
                                                    style={{ width: `${Math.min(parseFloat(criterion.weight || 0), 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(criterion)}
                                            className="text-yellow-600 hover:text-yellow-800 p-2 rounded-lg hover:bg-yellow-50"
                                            title="تعديل"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(criterion.id, criterion.name_ar || criterion.name)}
                                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                                            title="حذف"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {criteria.length === 0 && !showAddForm && (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <p className="text-gray-500 text-lg">لا توجد معايير قبول</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="mt-4 bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center gap-2"
                            >
                                <FaPlus />
                                إضافة معيار جديد
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <FaInfoCircle className="text-blue-600 text-2xl mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">كيف تعمل معايير القبول؟</h3>
                            <p className="text-gray-700">
                                يتم استخدام معايير القبول لتقييم المشاريع وتحديد ما إذا كانت تستوفي المتطلبات الأساسية للقبول.
                                كل معيار له وزن نسبي يؤثر على قرار القبول النهائي.
                                تأكد دائماً أن مجموع الأوزان يساوي 100% للحصول على تقييم دقيق.
                                <br />
                                <strong>المجموع الحالي: {parseFloat(totalWeight).toFixed(2)}%</strong>
                                {parseFloat(totalWeight) !== 100 && (
                                    <span className={`block mt-2 ${parseFloat(totalWeight) > 100 ? 'text-red-600' : 'text-yellow-600'}`}>
                                        {parseFloat(totalWeight) > 100
                                            ? '⚠️ مجموع الأوزان أكبر من 100%'
                                            : '⚠️ مجموع الأوزان أقل من 100%'}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

