# Inertia.js Payload Optimization

## ✅ Implemented Optimizations

### 1. Shared Props Optimization
- ✅ Reduced shared props to only essential data
- ✅ User data limited to: id, name, email, role, image
- ✅ Flash messages only (success, error)

### 2. Partial Reloads
- ✅ Using `preserveState` in React Query hooks
- ✅ Using `preserveScroll` for better UX
- ✅ Only reloading necessary data

### 3. Resource Transformation
- ✅ Created API Resources for consistent data structure
- ✅ Using ViewModels for complex pages
- ✅ Limiting nested relationships

### 4. Code Splitting
- ✅ Lazy loading utilities created
- ✅ Dynamic imports for heavy components
- ✅ Page-level code splitting

## Usage Examples

### Using React Query with Inertia
```javascript
// In a component
import { useTeachers } from '@/Hooks/useTeachers';

function TeachersPage() {
    const { data, isLoading } = useTeachers({ city: 'الرياض' });
    
    if (isLoading) return <TableSkeleton />;
    
    return <TeachersTable teachers={data} />;
}
```

### Using Skeleton Loaders
```javascript
import TableSkeleton from '@/Components/Loading/TableSkeleton';

function MyComponent() {
    if (loading) {
        return <TableSkeleton rows={10} columns={5} />;
    }
    // ... rest of component
}
```

### Using Lazy Loading
```javascript
import { lazy, Suspense } from 'react';
import { LazyTeachers } from '@/utils/lazyLoad';
import TableSkeleton from '@/Components/Loading/TableSkeleton';

function App() {
    return (
        <Suspense fallback={<TableSkeleton />}>
            <LazyTeachers />
        </Suspense>
    );
}
```

## Best Practices

1. **Always use Resources** for API responses
2. **Use ViewModels** for complex page data
3. **Limit shared props** to essential data only
4. **Use partial reloads** when possible
5. **Implement skeleton loaders** for better UX
6. **Use code splitting** for large components

