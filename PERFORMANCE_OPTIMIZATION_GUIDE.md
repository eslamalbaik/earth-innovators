# دليل التحسين الشامل للأداء - Performance Optimization Guide

## ✅ التحسينات المطبقة

### 1. Custom Hook: `useOptimisticCRUD`
تم إنشاء hook قابل لإعادة الاستخدام في `resources/js/Hooks/useOptimisticCRUD.js` يوفر:
- تحديثات UI فورية قبل تأكيد الخادم
- Partial reloads لمنع إعادة تحميل الصفحة بالكامل
- حالات التحميل لكل عنصر
- معالجة الأخطاء مع التراجع

**الاستخدام:**
```jsx
import { useOptimisticCRUD } from '@/Hooks/useOptimisticCRUD';

const { items, handleDelete, isDeleting } = useOptimisticCRUD(
    users?.data || [],
    'users',  // اسم المورد للـ partial reload
    ['stats'] // props إضافية لإعادة التحميل
);
```

### 2. تحسينات Backend (Laravel)

#### أ. Controller Optimizations
- استخدام `select()` لتحديد الحقول المطلوبة فقط
- Cache للـ stats والإحصائيات (5 دقائق)
- دعم `only` parameter للـ partial reloads
- استخدام `preserveState` و `preserveScroll`

#### ب. Middleware Optimization
تم تحسين `HandleInertiaRequests.php` لتقليل البيانات المشتركة

### 3. الصفحات المحسّنة حتى الآن

✅ **Admin:**
- Challenges/Index.jsx (مكتمل)
- Users/Index.jsx (مكتمل)

⏳ **قيد التنفيذ:**
- Projects/Index.jsx
- Publications/Index.jsx
- Bookings/Index.jsx
- Badges/Index.jsx
- Students/Index.jsx

⏳ **School:**
- Challenges/Index.jsx
- Students/Index.jsx
- Publications/Index.jsx
- Projects/Index.jsx

⏳ **Student:**
- Challenges/Index.jsx
- Projects/Index.jsx

## 📋 خطوات التطبيق على صفحات جديدة

### Frontend (React)

1. **استيراد الـ Hook:**
```jsx
import { useOptimisticCRUD } from '@/Hooks/useOptimisticCRUD';
import { useCallback } from 'react';
```

2. **استخدام الـ Hook:**
```jsx
const { items, handleDelete: optimisticDelete, isDeleting } = useOptimisticCRUD(
    items?.data || [],
    'items', // اسم المورد (يجب أن يطابق اسم prop في Inertia)
    ['stats', 'filters'] // props إضافية
);
```

3. **تحديث Handlers:**
```jsx
// Delete handler
const handleDelete = useCallback((item) => {
    optimisticDelete(item.id, route('admin.items.destroy', item.id), {
        confirmMessage: 'هل أنت متأكد؟',
        onSuccess: () => {
            // أي عمليات إضافية
        },
    });
}, [optimisticDelete]);

// Filter handler
const handleFilter = useCallback(() => {
    router.get(route('admin.items.index'), {
        search: search || undefined,
    }, {
        preserveState: true,
        preserveScroll: true,
        only: ['items', 'filters'], // Partial reload
    });
}, [search]);
```

4. **استخدام في JSX:**
```jsx
{items.map((item) => {
    const deleting = isDeleting(item.id);
    return (
        <tr key={item.id} className={deleting ? 'opacity-50' : ''}>
            <button
                onClick={() => handleDelete(item)}
                disabled={deleting}
            >
                {deleting ? 'جاري الحذف...' : 'حذف'}
            </button>
        </tr>
    );
})}
```

### Backend (Laravel Controller)

1. **Cache Stats:**
```php
$stats = Cache::remember('resource_stats', 300, function () {
    return [
        'total' => Model::count(),
        // ...
    ];
});
```

2. **Select Only Needed Fields:**
```php
$items = Model::select(['id', 'name', 'status', 'created_at'])
    ->with(['relation:id,name']) // Only needed relations
    ->paginate(20);
```

3. **Support Partial Reloads:**
```php
public function destroy(Model $item)
{
    $item->delete();
    Cache::forget('resource_stats');
    
    // Support partial reload
    if (request()->wantsJson() || request()->header('X-Inertia')) {
        return back()->with('success', 'تم الحذف بنجاح');
    }
    
    return redirect()->route('admin.items.index')
        ->with('success', 'تم الحذف بنجاح');
}
```

## 🎯 النتائج المتوقعة

- **Delete/Update Operations:** 3-4 ثواني → < 1 ثانية
- **Payload Size:** تقليل 40-50%
- **Re-renders:** تقليل 60-70%
- **Database Queries:** تقليل بواسطة caching

## ⚠️ ملاحظات مهمة

1. تأكد من أن اسم المورد في `useOptimisticCRUD` يطابق اسم prop في Inertia
2. استخدم `only` parameter فقط مع props التي تحتاج تحديث
3. Cache keys يجب أن تكون فريدة لكل resource
4. Clear cache بعد update/delete operations

