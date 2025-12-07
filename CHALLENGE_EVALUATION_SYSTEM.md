# نظام تقييم تسليمات التحديات والإشعارات

## نظرة عامة

تم تنفيذ نظام شامل لتقييم تسليمات الطلاب للتحديات مع ربط كامل بنظام الإشعارات. النظام يدعم جميع أنواع التغييرات (تسليم، تقييم، تعليق، حالة) ويرسل إشعارات للمستخدمين المعنيين (طالب، معلم، إدارة المدرسة) حسب قواعد التوجيه.

## المكونات المنفذة

### 1. النماذج (Models)

#### ChallengeEvaluation
- **الجدول**: `challenge_evaluations`
- **الحقول**:
  - `submission_id`: معرف التسليم
  - `evaluator_id`: معرف المقيّم
  - `role`: دور المقيّم (teacher, auto, admin)
  - `score`: الدرجة (0-100)
  - `feedback`: التعليق
  - `visibility`: مستوى الرؤية (student-visible, teacher-only, school-only)
  - `evaluated_at`: تاريخ التقييم

#### ChallengeSubmissionComment
- **الجدول**: `challenge_submission_comments`
- **الحقول**:
  - `submission_id`: معرف التسليم
  - `user_id`: معرف المستخدم
  - `comment`: نص التعليق
  - `mentioned_user_ids`: مصفوفة معرفات المستخدمين المذكورين
  - `parent_id`: معرف التعليق الأب (للردود)

#### NotificationPreference
- **الجدول**: `notification_preferences`
- **الحقول**:
  - `user_id`: معرف المستخدم
  - `notification_type`: نوع الإشعار
  - `enabled`: مفعّل/معطّل
  - `channels`: قنوات الإشعار المفضلة

### 2. الخدمات (Services)

#### EvaluationService
يدير عمليات التقييم:
- `createEvaluation()`: إنشاء تقييم جديد
- `updateEvaluation()`: تحديث تقييم موجود
- `deleteEvaluation()`: حذف تقييم
- `getSubmissionEvaluations()`: جلب تقييمات التسليم
- `validateEvaluatorPermissions()`: التحقق من صلاحيات المقيّم
- `awardPoints()`: منح النقاط بناءً على التقييم

#### ChallengeNotificationRouterService
يدير توجيه الإشعارات:
- `routeSubmissionCreated()`: توجيه إشعارات التسليم الجديد
- `routeEvaluationCreated()`: توجيه إشعارات التقييم الجديد
- `routeEvaluationUpdated()`: توجيه إشعارات تحديث التقييم
- `routeCommentAdded()`: توجيه إشعارات التعليقات
- `routeStatusChanged()`: توجيه إشعارات تغيير الحالة
- `shouldSendNotification()`: التحقق من إرسال الإشعار (deduplication + opt-out)
- `sendNotification()`: إرسال الإشعار مع تتبع deduplication

#### ChallengeCommentService
يدير التعليقات:
- `createComment()`: إنشاء تعليق جديد
- `updateComment()`: تحديث تعليق
- `deleteComment()`: حذف تعليق
- `getSubmissionComments()`: جلب تعليقات التسليم

### 3. الأحداث (Events)

- `SubmissionCreated`: عند إنشاء تسليم جديد
- `SubmissionUpdated`: عند تحديث تسليم
- `EvaluationCreated`: عند إنشاء تقييم جديد
- `EvaluationUpdated`: عند تحديث تقييم
- `EvaluationDeleted`: عند حذف تقييم
- `CommentAdded`: عند إضافة تعليق
- `StatusChanged`: عند تغيير حالة التسليم

### 4. المستمعون (Listeners)

- `HandleSubmissionCreated`: معالجة حدث إنشاء التسليم
- `HandleEvaluationCreated`: معالجة حدث إنشاء التقييم
- `HandleEvaluationUpdated`: معالجة حدث تحديث التقييم
- `HandleCommentAdded`: معالجة حدث إضافة التعليق
- `HandleStatusChanged`: معالجة حدث تغيير الحالة

### 5. الإشعارات (Notifications)

- `ChallengeSubmissionCreatedNotification`: إشعار تسليم جديد
- `ChallengeEvaluationCreatedNotification`: إشعار تقييم جديد
- `ChallengeEvaluationUpdatedNotification`: إشعار تحديث تقييم
- `ChallengeCommentAddedNotification`: إشعار تعليق جديد
- `ChallengeStatusChangedNotification`: إشعار تغيير حالة

## قواعد التوجيه (Notification Rules)

### 1. submission_created
- **المستلمون**: المعلم صاحب التحدي + إدارة المدرسة
- **الأولوية**: عالية
- **الرسالة**: "تم استلام تحدي جديد من {{studentName}} للتحدي '{{challengeTitle}}'."

### 2. evaluation_created
- **المستلمون**: الطالب (فقط إذا كان التقييم مرئي للطالب)
- **الأولوية**: عالية
- **الرسالة**: "تم تقييم تسليمك للتحدي '{{challengeTitle}}' — الدرجة: {{score}}. تعليق: {{feedback}}"

### 3. evaluation_updated
- **المستلمون**: الطالب + المعلم صاحب التحدي
- **الأولوية**: متوسطة
- **الرسالة**: "تحديث في تقييم تسليم {{studentName}} للتحدي '{{challengeTitle}}'. التقييم الآن: {{score}}."

### 4. comment_added
- **المستلمون**: المستخدمون المذكورون + الطالب + المعلم صاحب التحدي
- **الأولوية**: منخفضة
- **الرسالة**: "{{authorName}} أضاف تعليقًا على تسليم {{studentName}}: \"{{commentText}}\""

### 5. status_changed
- **المستلمون**: الطالب + المعلم صاحب التحدي + إدارة المدرسة
- **الأولوية**: متوسطة
- **الرسالة**: "تغير حالة التسليم لـ '{{challengeTitle}}' إلى '{{newStatus}}'."

## الميزات المنفذة

### 1. Atomicity (الذرية)
- جميع العمليات تتم ضمن معاملات قاعدة البيانات
- في حالة الفشل، يتم التراجع عن جميع التغييرات

### 2. Deduplication (إزالة التكرار)
- نافذة deduplication: 5 ثواني
- إذا تكرر نفس التغيير لنفس المرسل/المستلم خلال 5 ثواني، يتم دمج الإشعارات

### 3. Permission Checks (فحص الصلاحيات)
- التحقق من صلاحيات المقيّم قبل إنشاء التقييم
- التحقق من مستوى الرؤية قبل إرسال إشعارات التقييم للطلاب
- التقييمات المخفية (teacher-only) لا تُرسل للطلاب

### 4. Opt-out Support (دعم إيقاف الإشعارات)
- المستخدمون يمكنهم إيقاف أنواع إشعارات محددة
- يتم التحقق من التفضيلات قبل إرسال أي إشعار

### 5. Error Handling (معالجة الأخطاء)
- تسجيل جميع الأخطاء في ملفات السجل
- إعادة المحاولة التلقائية عبر Queue Jobs
- معالجة الأخطاء بشكل آمن دون تعطيل العملية الرئيسية

## كيفية الاستخدام

### إنشاء تقييم

```php
use App\Services\EvaluationService;

$evaluationService = app(EvaluationService::class);

$evaluation = $evaluationService->createEvaluation([
    'submission_id' => 1,
    'evaluator_id' => 5,
    'role' => 'teacher',
    'score' => 85,
    'feedback' => 'عمل ممتاز!',
    'visibility' => 'student-visible',
]);
```

### إضافة تعليق

```php
use App\Services\ChallengeCommentService;

$commentService = app(ChallengeCommentService::class);

$comment = $commentService->createComment([
    'submission_id' => 1,
    'user_id' => 5,
    'comment' => 'تعليق على التسليم',
    'mentioned_user_ids' => [10, 11], // مستخدمون مذكورون
]);
```

### تحديث حالة التسليم

```php
use App\Services\ChallengeSubmissionService;

$submissionService = app(ChallengeSubmissionService::class);

$submission = $submissionService->updateSubmission($submission, [
    'status' => 'approved',
]);
// سيتم إطلاق حدث StatusChanged تلقائياً
```

## قاعدة البيانات

### Migrations
1. `create_challenge_evaluations_table`
2. `create_challenge_submission_comments_table`
3. `add_resubmitted_withdrawn_to_challenge_submissions_table`
4. `create_notification_preferences_table`

### تشغيل Migrations

```bash
php artisan migrate
```

## الاختبار

تم تنفيذ جميع المكونات الأساسية. للاختبار:

1. إنشاء تسليم جديد → يجب أن يستلم المعلم وإدارة المدرسة إشعار
2. إنشاء تقييم → يجب أن يستلم الطالب إشعار (إذا كان مرئي)
3. تحديث تقييم → يجب أن يستلم الطالب والمعلم إشعار
4. إضافة تعليق → يجب أن يستلم المذكورون والطالب والمعلم إشعار
5. تغيير الحالة → يجب أن يستلم الطالب والمعلم وإدارة المدرسة إشعار

## ملاحظات إضافية

- جميع الإشعارات تدعم Broadcasting للـ real-time
- النظام يستخدم Queue Jobs للمعالجة غير المتزامنة
- يتم تخزين الإشعارات في قاعدة البيانات وفي الوقت الفعلي عبر Broadcasting
- النظام قابل للتوسع ويدعم إضافة أنواع إشعارات جديدة بسهولة

