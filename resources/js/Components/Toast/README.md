# Toast Notification System

A modern and stylish toast notification system for the Earth Innovators platform.

## Features

- ✅ Top-left corner positioning
- ✅ Slide-in-left animation on enter
- ✅ Fade-out animation on exit
- ✅ Auto-dismiss after 5000ms (configurable)
- ✅ Queue notifications
- ✅ Prevent duplicates
- ✅ Multiple toast types (success, error, warning, info)
- ✅ Responsive design
- ✅ RTL support

## Usage

### Basic Usage

```jsx
import { useToast } from '@/Contexts/ToastContext';

function MyComponent() {
    const { showSuccess, showError, showWarning, showInfo } = useToast();

    const handleSuccess = () => {
        showSuccess('تم الحفظ بنجاح');
    };

    const handleError = () => {
        showError('حدث خطأ أثناء الحفظ');
    };

    return (
        <div>
            <button onClick={handleSuccess}>Show Success</button>
            <button onClick={handleError}>Show Error</button>
        </div>
    );
}
```

### Advanced Usage

```jsx
const { showToast, addToast } = useToast();

// Custom toast with title
showToast('تم تحديث البيانات', {
    title: 'تحديث لوحة التحكم',
    type: 'info',
    autoDismiss: 5000,
});

// Manual toast creation
addToast({
    message: 'إشعار مخصص',
    title: 'عنوان الإشعار',
    type: 'success',
    autoDismiss: 3000,
});
```

### Toast Types

- `success` - Green toast for success messages
- `error` - Red toast for error messages
- `warning` - Yellow toast for warning messages
- `info` - Blue toast for informational messages (default)

### Options

- `message` (required) - The toast message
- `title` (optional) - The toast title
- `type` (optional) - Toast type: 'success', 'error', 'warning', 'info' (default: 'info')
- `autoDismiss` (optional) - Auto-dismiss time in milliseconds (default: 5000)

## Integration

The Toast system is already integrated into:
- `DashboardLayout` - Automatically shows toasts on dashboard changes
- `app.jsx` - ToastProvider wraps the entire application

## Automatic Dashboard Notifications

The system automatically detects changes in:
- Teacher dashboard
- Student dashboard
- School dashboard

When dashboard data changes, a toast notification is automatically displayed.

