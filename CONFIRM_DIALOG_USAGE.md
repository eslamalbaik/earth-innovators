# استخدام نافذة التأكيد الحديثة

تم استبدال جميع نوافذ التأكيد الافتراضية للمتصفح (`window.confirm`) بنافذة تأكيد حديثة وجميلة.

## كيفية الاستخدام

### 1. استيراد Hook

```jsx
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
```

### 2. استخدام Hook في Component

```jsx
export default function MyComponent() {
    const { confirm } = useConfirmDialog();

    const handleDelete = async (itemId) => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا العنصر؟',
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger', // 'danger' | 'warning' | 'info'
        });

        if (confirmed) {
            // تنفيذ الإجراء
            router.delete(`/items/${itemId}`);
        }
    };

    return (
        // ... JSX
    );
}
```

### 3. أمثلة الاستخدام

#### مثال بسيط
```jsx
const handleDelete = async (id) => {
    const confirmed = await confirm({
        message: 'هل أنت متأكد من الحذف؟',
    });

    if (confirmed) {
        router.delete(`/items/${id}`);
    }
};
```

#### مثال متقدم
```jsx
const handleDelete = async (itemName, itemId) => {
    const confirmed = await confirm({
        title: 'تأكيد الحذف',
        message: `هل أنت متأكد من حذف "${itemName}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        variant: 'danger',
    });

    if (confirmed) {
        router.delete(`/items/${itemId}`, {
            preserveScroll: true,
        });
    }
};
```

### 4. الخيارات المتاحة

- `title` (string): عنوان النافذة (افتراضي: "تأكيد الإجراء")
- `message` (string): رسالة التأكيد (افتراضي: "هل أنت متأكد من تنفيذ هذا الإجراء؟")
- `confirmText` (string): نص زر التأكيد (افتراضي: "تأكيد")
- `cancelText` (string): نص زر الإلغاء (افتراضي: "إلغاء")
- `variant` (string): نوع التأكيد - 'danger' | 'warning' | 'info' (افتراضي: 'danger')

### 5. ملاحظات

- الـ hook يرجع Promise<boolean>
- `true` عند الضغط على زر التأكيد
- `false` عند الضغط على زر الإلغاء أو إغلاق النافذة
- النافذة تظهر بشكل تلقائي عند استدعاء `confirm()`
- التصميم حديث ويستخدم Tailwind CSS

## مثال: استبدال window.confirm

**قبل:**
```jsx
const handleDelete = (id) => {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        router.delete(`/items/${id}`);
    }
};
```

**بعد:**
```jsx
const { confirm } = useConfirmDialog();

const handleDelete = async (id) => {
    const confirmed = await confirm({
        message: 'هل أنت متأكد من الحذف؟',
    });

    if (confirmed) {
        router.delete(`/items/${id}`);
    }
};
```

