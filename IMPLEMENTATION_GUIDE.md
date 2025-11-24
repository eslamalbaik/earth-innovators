# Implementation Guide - Continuing the Refactoring

## 🎯 Quick Start

The foundation for Clean Architecture has been established. Follow these patterns to continue refactoring the remaining controllers.

## 📋 Step-by-Step Refactoring Process

### Step 1: Create Repository (if needed)

```php
// app/Repositories/YourModelRepository.php
namespace App\Repositories;

use App\Models\YourModel;

class YourModelRepository extends BaseRepository
{
    protected function model(): string
    {
        return YourModel::class;
    }

    // Add custom query methods here
    public function findByCustomField($value)
    {
        return $this->model->where('custom_field', $value)->get();
    }
}
```

### Step 2: Create DTOs

```php
// app/DTO/YourFeature/CreateYourModelDTO.php
namespace App\DTO\YourFeature;

use App\DTO\BaseDTO;

class CreateYourModelDTO extends BaseDTO
{
    public string $name;
    public string $email;
    
    public static function fromRequest(array $data): self
    {
        $dto = new self();
        $dto->name = $data['name'];
        $dto->email = $data['email'];
        return $dto;
    }
}
```

### Step 3: Create FormRequest

```php
// app/Http/Requests/YourFeature/CreateYourModelRequest.php
namespace App\Http\Requests\YourFeature;

use Illuminate\Foundation\Http\FormRequest;

class CreateYourModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
        ];
    }
}
```

### Step 4: Create Service

```php
// app/Services/YourModelService.php
namespace App\Services;

use App\DTO\YourFeature\CreateYourModelDTO;
use App\Repositories\YourModelRepository;
use Illuminate\Support\Facades\Cache;

class YourModelService extends BaseService
{
    public function __construct(
        private YourModelRepository $repository
    ) {}

    public function getAll(?string $search = null, int $perPage = 20)
    {
        $cacheKey = "your_models_" . md5($search ?? '') . "_{$perPage}";
        
        return $this->cache($cacheKey, function () use ($search, $perPage) {
            $query = $this->repository->getModel();
            
            if ($search) {
                $query->where('name', 'like', "%{$search}%");
            }
            
            return $query->select('id', 'name', 'email') // Only select needed columns
                ->with('relation') // Eager load relations
                ->paginate($perPage);
        }, 300);
    }

    public function create(CreateYourModelDTO $dto)
    {
        $model = $this->repository->create([
            'name' => $dto->name,
            'email' => $dto->email,
        ]);

        // Clear cache
        $this->forgetCacheTags(['your_models']);

        return $model;
    }
}
```

### Step 5: Register Service in AppServiceProvider

```php
// app/Providers/AppServiceProvider.php
$this->app->bind(
    \App\Services\YourModelService::class,
    function ($app) {
        return new \App\Services\YourModelService(
            $app->make(\App\Repositories\YourModelRepository::class)
        );
    }
);
```

### Step 6: Refactor Controller

```php
// app/Http/Controllers/YourController.php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\YourFeature\CreateYourModelRequest;
use App\DTO\YourFeature\CreateYourModelDTO;
use App\Services\YourModelService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class YourController extends Controller
{
    public function __construct(
        private YourModelService $service
    ) {}

    public function index(Request $request)
    {
        $models = $this->service->getAll(
            $request->get('search'),
            20
        );

        return Inertia::render('YourFeature/Index', [
            'models' => $models,
        ]);
    }

    public function store(CreateYourModelRequest $request)
    {
        $dto = CreateYourModelDTO::fromRequest($request->validated());
        $this->service->create($dto);

        return redirect()->route('your.route')
            ->with('success', 'تم الإنشاء بنجاح');
    }
}
```

## 🔍 Query Optimization Checklist

When refactoring, ensure:

- [ ] Use `select()` to limit columns
- [ ] Use `with()` for eager loading relations
- [ ] Use `withCount()` for counts
- [ ] Batch queries instead of loops
- [ ] Use aggregate queries for statistics
- [ ] Avoid N+1 queries
- [ ] Use indexes on frequently queried columns

## 💾 Caching Strategy

### When to Cache:
- ✅ Dashboard statistics (5 minutes)
- ✅ Lists with filters (5 minutes)
- ✅ Static data (1 hour)
- ✅ Permissions (1 hour)
- ✅ Settings (1 hour)

### Cache Invalidation:
```php
// Clear specific cache
$this->forgetCache('cache_key');

// Clear tag-based cache
$this->forgetCacheTags(['tag_name']);

// Clear all cache (use sparingly)
Cache::flush();
```

## 🚀 Queue Jobs

### When to Use Queues:
- ✅ Email notifications
- ✅ File processing
- ✅ Report generation
- ✅ Analytics processing
- ✅ Heavy calculations

### Creating Queue Jobs:
```php
// app/Jobs/YourJob.php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class YourJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private $data
    ) {}

    public function handle(): void
    {
        // Your heavy operation here
    }
}

// Dispatch in Service
YourJob::dispatch($data);
```

## ⚛️ Frontend: React Query

### Creating Hooks:
```jsx
// resources/js/Hooks/useYourModel.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from '@inertiajs/react';

export function useYourModels(search = '', page = 1) {
    return useQuery({
        queryKey: ['yourModels', search, page],
        queryFn: async () => {
            const { data } = await axios.get('/your-route', {
                params: { search, page },
            });
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateYourModel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (modelData) => {
            return router.post('/your-route', modelData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['yourModels'] });
        },
    });
}
```

### Using in Components:
```jsx
import { useYourModels, useCreateYourModel } from '@/Hooks/useYourModel';
import { TableSkeleton } from '@/Components/Loading/SkeletonLoader';

function YourComponent() {
    const { data, isLoading } = useYourModels(search, page);
    const createMutation = useCreateYourModel();

    if (isLoading) return <TableSkeleton />;

    return (
        <div>
            {/* Your component */}
        </div>
    );
}
```

## 📊 Performance Monitoring

### Key Metrics to Track:
1. **Query Count**: Use Laravel Debugbar
2. **Response Time**: Monitor in production
3. **Cache Hit Rate**: Track cache effectiveness
4. **Queue Processing Time**: Monitor job performance

### Tools:
- Laravel Debugbar (development)
- Laravel Telescope (development/staging)
- New Relic / Datadog (production)
- Laravel Horizon (queue monitoring)

## ✅ Testing Checklist

After refactoring each controller:

- [ ] Unit tests for Service methods
- [ ] Feature tests for Controller endpoints
- [ ] Integration tests for full workflows
- [ ] Performance tests (query count, response time)
- [ ] Cache invalidation tests

## 🎨 Code Quality

### Before Committing:
```bash
# PHP
composer pint  # Format PHP code
./vendor/bin/phpstan analyse  # Type checking

# JavaScript
npm run lint:fix  # Fix linting issues
npm run format  # Format code
```

## 📚 Resources

- [Laravel Best Practices](https://laravel.com/docs)
- [React Query Documentation](https://tanstack.com/query)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://designpatternsphp.readthedocs.io/en/latest/More/Repository/README.html)

## 🆘 Common Issues

### Issue: Cache not clearing
**Solution**: Use tag-based caching and clear tags properly

### Issue: N+1 queries still present
**Solution**: Use `with()` for relations, check Laravel Debugbar

### Issue: Queue jobs not processing
**Solution**: Ensure queue worker is running: `php artisan queue:work`

### Issue: React Query not updating
**Solution**: Check query keys match, use `invalidateQueries` after mutations

## 🎯 Priority Order for Refactoring

1. **High Traffic Controllers** (Dashboards, Lists)
2. **Complex Controllers** (Multi-step processes)
3. **Controllers with N+1** (Check Debugbar)
4. **Remaining Controllers** (Systematic approach)

## 📝 Notes

- Always test after refactoring
- Monitor performance improvements
- Document any custom patterns
- Keep services focused (Single Responsibility)
- Use dependency injection consistently

