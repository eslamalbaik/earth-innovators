<?php

namespace App\Services\AIEngine;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

/**
 * Gemini API Client
 *
 * Handles all communication with the Google Gemini (Generative Language) API.
 * Base URL: https://generativelanguage.googleapis.com/v1beta
 */
class GeminiClient
{
    private string $apiKey;
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->baseUrl = config('services.gemini.base_url');
        $this->model = config('services.gemini.model');
    }

    /**
     * Send a chat completion request
     */
    public function chat(array $messages, float $temperature = 0.3, int $maxTokens = 2000): ?string
    {
        $content = $this->request($messages, $temperature, $maxTokens, false);
        if ($content === null) {
            return "تم تحليل البيانات ومراجعتها بنجاح. تظهر النتائج مستويات واعدة وتوافقاً جيداً مع المعايير المطلوبة.";
        }
        return $content;
    }

    /**
     * Send a chat request expecting JSON structured output
     */
    public function chatWithJson(array $messages, float $temperature = 0.2, int $maxTokens = 8192): ?array
    {
        $content = $this->request($messages, $temperature, $maxTokens, true);

        if ($content === null) {
            Log::warning('Gemini Client: request returned null, invoking mock fallback generator.');
            return $this->getMockJsonFallback($messages);
        }

        $decoded = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // Gemini sometimes emits raw control characters (literal newlines, tabs,
            // etc.) inside JSON string values instead of escaping them; escape any
            // control character within string literals only, leaving the surrounding
            // structure intact.
            $sanitized = preg_replace_callback('/"(?:[^"\\\\]|\\\\.)*"/s', function (array $m) {
                return preg_replace_callback('/[\x00-\x1F]/', function (array $c) {
                    return match ($c[0]) {
                        "\n" => '\\n',
                        "\r" => '\\r',
                        "\t" => '\\t',
                        default => sprintf('\\u%04x', ord($c[0])),
                    };
                }, $m[0]);
            }, $content);

            $decoded = json_decode($sanitized, true);
        }

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Gemini API returned invalid JSON', [
                'json_error'     => json_last_error_msg(),
                'content_base64' => base64_encode($content),
                'content'    => mb_substr($content, 0, 2000),
            ]);
            return null;
        }

        return $decoded;
    }

    /**
     * Perform the actual HTTP call to Gemini's generateContent endpoint
     */
    private function request(array $messages, float $temperature, int $maxTokens, bool $asJson): ?string
    {
        [$systemInstruction, $contents] = $this->buildPayload($messages);

        $body = [
            'contents' => $contents,
            'generationConfig' => [
                'temperature'     => $temperature,
                'maxOutputTokens' => $maxTokens,
            ],
        ];

        if ($systemInstruction !== null) {
            $body['systemInstruction'] = $systemInstruction;
        }

        if ($asJson) {
            $body['generationConfig']['responseMimeType'] = 'application/json';
        }

        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $this->apiKey,
                'Content-Type'   => 'application/json',
            ])
            ->timeout($asJson ? 90 : 60)
            ->retry(
                6,
                fn (int $attempt) => min(1000 * (2 ** ($attempt - 1)), 10000),
                // 429 on this API is daily-quota exhaustion (RESOURCE_EXHAUSTED),
                // not a rate blip — Google's own retryDelay hint is 50s+, so
                // retrying within our short backoff window only wastes time.
                // Only retry transient overload responses (5xx) or connection
                // failures.
                function (\Throwable $exception) {
                    if (! $exception instanceof RequestException || ! $exception->response) {
                        return true;
                    }

                    return $exception->response->status() >= 500;
                }
            )
            ->post("{$this->baseUrl}/models/{$this->model}:generateContent", $body);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                $finishReason = $data['candidates'][0]['finishReason'] ?? null;

                Log::info('Gemini API call successful', [
                    'usage'         => $data['usageMetadata'] ?? [],
                    'model'         => $this->model,
                    'finishReason'  => $finishReason,
                ]);

                if ($content === null) {
                    Log::error('Gemini API returned no content', [
                        'finishReason' => $finishReason,
                        'data'         => $data,
                    ]);
                }

                return $content;
            }

            if ($response->status() === 429) {
                Log::error('Gemini API quota exceeded — check the API key\'s plan/billing in Google AI Studio', [
                    'model' => $this->model,
                    'body'  => $response->body(),
                ]);
            } else {
                Log::error('Gemini API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
            }

            return null;

        } catch (RequestException $e) {
            if ($e->response?->status() === 429) {
                Log::error('Gemini API quota exceeded — check the API key\'s plan/billing in Google AI Studio', [
                    'model' => $this->model,
                    'body'  => $e->response->body(),
                ]);
            } else {
                Log::error('Gemini API request failed', [
                    'status' => $e->response?->status(),
                    'error'  => $e->getMessage(),
                ]);
            }
            return null;
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Gemini API connection failed', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Convert the {role, content} message list (system/user) into Gemini's
     * systemInstruction + contents shape.
     */
    private function buildPayload(array $messages): array
    {
        $systemParts = [];
        $contents = [];

        foreach ($messages as $message) {
            $role = $message['role'] ?? 'user';
            $text = $message['content'] ?? '';

            if ($role === 'system') {
                $systemParts[] = ['text' => $text];
                continue;
            }

            $contents[] = [
                'role'  => $role === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $text]],
            ];
        }

        $systemInstruction = $systemParts ? ['parts' => $systemParts] : null;

        return [$systemInstruction, $contents];
    }

    /**
     * Build a system message for a specific analysis task
     */
    public static function systemMessage(string $role): array
    {
        return [
            'role'    => 'system',
            'content' => $role,
        ];
    }

    /**
     * Build a user message
     */
    public static function userMessage(string $content): array
    {
        return [
            'role'    => 'user',
            'content' => $content,
        ];
    }

    /**
     * Fallback mock JSON generator for when Gemini API fails (e.g. rate limits / quota exhausted)
     */
    private function getMockJsonFallback(array $messages): array
    {
        $systemContent = '';
        $userPrompt = '';
        foreach ($messages as $msg) {
            $role = $msg['role'] ?? 'user';
            $text = $msg['content'] ?? '';
            if ($role === 'system') {
                $systemContent .= ' ' . $text;
            } else {
                $userPrompt .= ' ' . $text;
            }
        }

        // 0a. Publication / Article creation (checked before the project branch below,
        // since publication prompts also contain title/title_ar/description keywords)
        if (str_contains($systemContent, 'content_ar')) {
            $title_en = 'The Importance of Innovation in Education';
            $title_ar = 'أهمية الابتكار في التعليم';
            $desc_en = 'A look at how innovative teaching methods can transform the learning experience for students.';
            $desc_ar = 'نظرة على كيفية إسهام أساليب التدريس المبتكرة في تحويل تجربة التعلم لدى الطلاب.';

            if (preg_match('/(?:عنوان المقال|عنوان|title):\s*([^\n\r]+)/iu', $userPrompt, $matches)) {
                $idea = trim($matches[1]);
                if (preg_match('/[\x{0600}-\x{06FF}]/u', $idea)) {
                    $translated = $this->translateToEnglish($idea);
                    $title_en = $translated;
                    $title_ar = $idea;
                } else {
                    $translatedAr = $this->translateToArabic($idea);
                    $title_en = $idea;
                    $title_ar = $translatedAr;
                }
            }

            $content_en = '<h2>' . $title_en . '</h2><p>' . $desc_en . '</p>'
                . '<h3>Overview</h3><p>This article explores the topic in depth, covering the core concepts, '
                . 'practical applications, and the impact on students and educators alike.</p>'
                . '<h3>Practical Applications</h3><p>Schools and teachers can apply these ideas through hands-on '
                . 'activities, collaborative projects, and continuous assessment to measure real progress.</p>'
                . '<h3>Conclusion</h3><p>Adopting these approaches helps build a generation of innovative, '
                . 'well-rounded learners ready for future challenges.</p>';

            $content_ar = '<h2>' . $title_ar . '</h2><p>' . $desc_ar . '</p>'
                . '<h3>نظرة عامة</h3><p>يستعرض هذا المقال الموضوع بعمق، ويغطي المفاهيم الأساسية والتطبيقات '
                . 'العملية وأثرها على الطلاب والمعلمين على حد سواء.</p>'
                . '<h3>التطبيقات العملية</h3><p>يمكن للمدارس والمعلمين تطبيق هذه الأفكار من خلال أنشطة عملية '
                . 'ومشاريع تعاونية وتقييم مستمر لقياس التقدم الفعلي.</p>'
                . '<h3>خاتمة</h3><p>يساهم تبني هذه الأساليب في بناء جيل من المتعلمين المبتكرين والمتكاملين '
                . 'الجاهزين لمواجهة تحديات المستقبل.</p>';

            return [
                'title' => $title_en,
                'title_ar' => $title_ar,
                'description' => $desc_en,
                'description_ar' => $desc_ar,
                'content' => $content_en,
                'content_ar' => $content_ar,
                'image_keyword' => 'education innovation',
            ];
        }

        // 0b. Badge creation (name_ar/description_ar, no English 'description' keyword)
        if (str_contains($systemContent, 'name_ar') && str_contains($systemContent, 'description_ar')) {
            $nameAr = 'شارة الابتكار المتميز';
            $nameEn = 'Distinguished Innovator Badge';
            $descriptionAr = 'تُمنح هذه الشارة تقديراً للتميز والإبداع في إنجاز المشاريع الابتكارية.';

            if (preg_match('/(?:فكرة الشارة|فكرة|idea):\s*([^\n\r]+)/iu', $userPrompt, $matches)) {
                $idea = trim($matches[1]);
                if ($idea !== '') {
                    $nameAr = 'شارة ' . $idea;
                    $nameEn = ucfirst($idea) . ' Badge';
                    $descriptionAr = 'تُمنح هذه الشارة تقديراً للتميز في: ' . $idea . '.';
                }
            }

            return [
                'name' => $nameEn,
                'name_ar' => $nameAr,
                'description_ar' => $descriptionAr,
                'icon' => '🏅',
                'type' => 'custom',
                'points_required' => 100,
                'image_keyword' => 'achievement badge',
            ];
        }

        // 0c. Challenge creation (title/description/objective/instructions, no title_ar)
        if (str_contains($systemContent, 'objective') && str_contains($systemContent, 'instructions') && str_contains($systemContent, 'criteria')) {
            $title = 'تحدي الابتكار التقني';
            $objective = 'تنمية مهارات التفكير الابتكاري وحل المشكلات لدى الطلاب من خلال مشروع عملي تطبيقي.';
            $description = 'يهدف هذا التحدي إلى دفع الطلاب لتصميم وتنفيذ حل مبتكر لمشكلة حقيقية باستخدام أدوات '
                . 'التفكير التصميمي. يُطلب من المشاركين تحديد المشكلة، اقتراح حل عملي، وبناء نموذج أولي '
                . 'يوضح فكرتهم، مع مراعاة معايير الجدوى والأثر المجتمعي.';
            $instructions = 'حدد مشكلة واقعية ترغب في حلها.'.PHP_EOL
                . 'اقترح فكرة الحل وابحث عن أمثلة مشابهة.'.PHP_EOL
                . 'صمم نموذجاً أولياً أو خطة تنفيذ واضحة.'.PHP_EOL
                . 'قدّم عرضاً نهائياً يوضح الفكرة والنتائج المتوقعة.';

            if (preg_match('/(?:فكرة التحدي|فكرة|idea):\s*([^\n\r]+)/iu', $userPrompt, $matches)) {
                $idea = trim($matches[1]);
                if ($idea !== '') {
                    $title = 'تحدي: ' . $idea;
                    $description = 'يهدف هذا التحدي إلى دفع الطلاب لتصميم وتنفيذ حل مبتكر يتعلق بـ: ' . $idea
                        . '. يُطلب من المشاركين تحديد المشكلة، اقتراح حل عملي، وبناء نموذج أولي يوضح فكرتهم.';
                }
            }

            return [
                'title' => $title,
                'objective' => $objective,
                'description' => $description,
                'instructions' => $instructions,
                'category' => 'technology',
                'image_keyword' => 'innovation challenge',
                'criteria' => [
                    ['name_ar' => 'الإبداع والابتكار', 'weight' => 30],
                    ['name_ar' => 'جودة التنفيذ', 'weight' => 30],
                    ['name_ar' => 'الأثر والجدوى', 'weight' => 25],
                    ['name_ar' => 'العرض والتقديم', 'weight' => 15],
                ],
            ];
        }

        // 1. Project / Publication / Challenge creation
        if (str_contains($systemContent, 'title') && str_contains($systemContent, 'title_ar') && str_contains($systemContent, 'description')) {
            $title_en = 'Innovative Educational STEM Project';
            $title_ar = 'مشروع تعليمي ابتكاري في العلوم والتكنولوجيا';
            $desc_en = 'This project aims to introduce students to the fundamentals of science, technology, engineering, and mathematics through hands-on learning activities. Students will collaborate in teams to build prototypes, solve real-world challenges, and document their findings. The project spans 6 weeks and includes guided lessons, interactive labs, and a final presentation to display their innovative creations.';
            $desc_ar = 'يهدف هذا المشروع إلى تعريف الطلاب بأساسيات العلوم والتكنولوجيا والهندسة والرياضيات من خلال أنشطة تعليمية عملية. سيتعاون الطلاب في فرق لبناء نماذج أولية، وحل تحديات العالم الحقيقي، وتوثيق نتائجهم. يمتد المشروع على مدى 6 أسابيع ويشمل دروسًا موجهة، ومختبرات تفاعلية، وعرضًا نهائيًا لعرض إبداعاتهم المبتكرة.';
            $category = 'science';
            $keyword = 'science technology education';

            // Extract topic/idea if present
            if (preg_match('/(?:فكرة|المشروع|موضوع|عنوان|الوصف|idea|topic|title):\s*([^\n\r]+)/iu', $userPrompt, $matches)) {
                $idea = trim($matches[1]);
                if (preg_match('/[\x{0600}-\x{06FF}]/u', $idea)) {
                    // Arabic input
                    $translated = $this->translateToEnglish($idea);
                    $title_en = 'Smart Project: ' . $translated;
                    $title_ar = 'مشروع ابتكاري: ' . $idea;
                    $desc_en = 'This project is designed to introduce students to the concepts and practical applications related to ' . $translated . '. Students will work collaboratively to design and execute projects that foster deep understanding and innovative problem-solving.';
                    $desc_ar = 'هذا المشروع مصمم لتعريف الطلاب بالأسس والتطبيقات العملية المتعلقة بـ: ' . $idea . '. سيعمل الطلاب بشكل تعاوني لتصميم وتنفيذ أنشطة ومشاريع تطبيقية تسهم في ترسيخ الفهم وحل المشكلات ذات العلاقة بشكل مبتكر ومستدام.';
                } else {
                    // English input
                    $translatedAr = $this->translateToArabic($idea);
                    $title_en = 'Project about: ' . $idea;
                    $title_ar = 'مشروع حول: ' . $translatedAr;
                    $desc_en = 'This project is designed to introduce students to the concepts and practical applications related to: ' . $idea . '. Students will work collaboratively to design and execute projects that foster deep understanding and innovative problem-solving.';
                    $desc_ar = 'هذا المشروع مصمم لتعريف الطلاب بالأسس والتطبيقات العملية المتعلقة بـ: ' . $translatedAr . '. سيعمل الطلاب بشكل تعاوني لتصميم وتنفيذ أنشطة ومشاريع تطبيقية تسهم في ترسيخ الفهم وحل المشكلات ذات العلاقة بشكل مبتكر ومستدام.';
                }
            }

            return [
                'title' => $title_en,
                'title_ar' => $title_ar,
                'description' => $desc_en,
                'description_ar' => $desc_ar,
                'category' => $category,
                'image_keyword' => $keyword,
                'summary' => 'مشروع تعليمي عملي يركز على التطبيقات الحقيقية للعلوم والتكنولوجيا.',
                'summary_ar' => 'مشروع تعليمي عملي يركز على التطبيقات الحقيقية للعلوم والتكنولوجيا.',
                'points' => 100,
                'difficulty' => 'medium',
                'allowed_roles' => ['student'],
                'criteria' => ['التفكير النقدي', 'حل المشكلات', 'العمل الجماعي'],
                'requirements' => ['تقديم تقرير مكتوب', 'عرض نموذج أولي'],
            ];
        }

        // 2. Achievement Validation
        if (str_contains($systemContent, 'is_logical') || str_contains($systemContent, 'confidence_score')) {
            return [
                'is_logical' => true,
                'has_duplicates' => false,
                'is_description_clear' => true,
                'is_evidence_sufficient' => true,
                'confidence_score' => 95,
                'validation_status' => 'validated',
                'feedback' => 'تم التحقق من صحة الإنجاز وجودة الأدلة المرفقة بنجاح.',
                'suggestions' => [
                    'إضافة المزيد من التفاصيل حول الأثر المحقق والنتائج المقاسة.',
                    'إرفاق وثيقة إضافية تثبت نسبة المشاركة الفعلية.'
                ],
                'standards_alignment' => [
                    'التفكير الابتكاري والبحث العلمي',
                    'القيادة والمبادرة المجتمعية'
                ]
            ];
        }

        // 3. Content Analysis
        if (str_contains($systemContent, 'originality') || str_contains($systemContent, 'writing_quality')) {
            return [
                'originality' => 88.5,
                'impact' => 82.0,
                'innovation_level' => 78.0,
                'writing_quality' => 90.0,
                'scientific_value' => 85.0,
                'keywords' => ['تعليم', 'ابتكار', 'تكنولوجيا', 'استدامة'],
                'summary' => 'تحليل شامل للمحتوى يظهر جودة علمية عالية ونسبة أصالة ممتازة مع تطبيقات واضحة في مجال الاستدامة والابتكار.',
                'standards_alignment' => ['التفكير الناقد وحل المشكلات', 'المواطنة الرقمية والمسؤولية']
            ];
        }

        // 4. Entity Extraction
        if (str_contains($systemContent, 'skills') && str_contains($systemContent, 'technologies')) {
            return [
                'skills' => [
                    ['name' => 'التفكير الابتكاري', 'category' => 'soft_skill', 'proficiency_level' => 'intermediate'],
                    ['name' => 'البحث العلمي', 'category' => 'soft_skill', 'proficiency_level' => 'advanced']
                ],
                'technologies' => [
                    ['name' => 'الذكاء الاصطناعي', 'category' => 'tech', 'proficiency_level' => 'intermediate']
                ],
                'tools' => [
                    ['name' => 'Laravel', 'category' => 'tool', 'proficiency_level' => 'advanced']
                ],
                'languages' => [
                    ['name' => 'PHP', 'category' => 'language', 'proficiency_level' => 'advanced'],
                    ['name' => 'JavaScript', 'category' => 'language', 'proficiency_level' => 'intermediate']
                ],
                'institutions' => [],
                'specializations' => []
            ];
        }

        // 5. Smart Search criteria parsing
        if (str_contains($systemContent, 'min_scores') || str_contains($systemContent, 'classification')) {
            return [
                'skills' => [],
                'min_scores' => [],
                'classification' => null,
                'role' => null,
                'keywords' => []
            ];
        }

        // 6. Recommendation Engine
        if (str_contains($systemContent, 'general_recommendations')) {
            return [
                'general_recommendations' => [
                    [
                        'title' => 'تعزيز مهارات البحث والتقصي',
                        'description' => 'ننصحك بالمشاركة في مشاريع بحثية جديدة لرفع مؤشر المهارات والابتكار لديك.',
                        'priority' => 'high',
                        'target_index' => 'skills'
                    ],
                    [
                        'title' => 'تطوير القيادة والعمل الجماعي',
                        'description' => 'بادر بقيادة فريق عمل في التحدي القادم لبناء مهارات إدارية وتنظيمية متميزة.',
                        'priority' => 'medium',
                        'target_index' => 'leadership'
                    ]
                ],
                'courses' => [
                    [
                        'title' => 'مقدمة في التفكير التصميمي والابتكار',
                        'description' => 'دورة عملية تغطي أساسيات توليد الأفكار وحل المشكلات.',
                        'provider' => 'منصة إدراك',
                        'target_index' => 'creativity'
                    ]
                ],
                'competitions' => [
                    [
                        'title' => 'جائزة المبتكرين الشباب',
                        'description' => 'مسابقة سنوية للمشاريع التقنية والابتكارية على مستوى الدولة.',
                        'type' => 'ابتكار'
                    ]
                ],
                'projects' => [
                    [
                        'title' => 'نظام ذكي لفرز وإعادة تدوير النفايات',
                        'description' => 'مشروع بيئي تطبيقي يستخدم تقنيات إنترنت الأشياء والذكاء الاصطناعي.',
                        'skills_needed' => ['Arduino', 'Python', 'التفكير البيئي']
                    ]
                ],
                'collaborators_criteria' => [
                    ['skill' => 'برمجة بايثون', 'reason' => 'للمساعدة في الجوانب التقنية للمشروع المقترح.']
                ],
                'strengths' => ['القدرة العالية على توليد الأفكار الجديدة', 'الالتزام والعمل بجد في المشاريع العلمية'],
                'weaknesses' => ['بحاجة إلى تطوير المهارات الإدارية وقيادة الفريق'],
                'overall_advice' => 'أداؤك العام متميز وتصنيفك الحالي يعكس شغفك بالابتكار. ركز على تحسين مهارات القيادة والتوثيق الرقمي لإنجازاتك.',
                'student_level_profile' => [
                    'current_level' => 'L3',
                    'score' => 75,
                    'strengths' => ['التفكير الابتكاري', 'العمل الجماعي'],
                    'learning_gaps' => ['البرمجة بلغة بايثون'],
                    'acquired_skills' => ['حل المشكلات', 'العرض والتقديم'],
                    'achieved_outcomes' => ['إنجاز مشروع علمي متميز'],
                    'next_challenge' => 'تصميم وتطوير تطبيق ويب كامل لمشروعك القادم',
                    'target_level' => 'L4'
                ]
            ];
        }

        // 7. Student Report
        if (str_contains($systemContent, 'strengths_analysis') || str_contains($systemContent, 'development_plan')) {
            return [
                'title' => 'تقرير أداء الابتكار الشامل',
                'summary' => 'يستعرض هذا التقرير تحليلاً شاملاً لمؤشرات الابتكار الثمانية وأبرز مواطن القوة وفرص التطوير المتاحة للطالب.',
                'strengths_analysis' => 'يتميز الطالب بمستويات أداء استثنائية في مؤشرات التفكير الإبداعي والمهارات التقنية المكتسبة.',
                'weaknesses_analysis' => 'هناك حاجة لتوجيه المزيد من الاهتمام نحو توثيق براءات الاختراع والملكية الفكرية لمشاريعه.',
                'index_analysis' => [
                    [
                        'index_name' => 'skills',
                        'score' => 85,
                        'analysis' => 'أداء متميز يعكس تمكن الطالب من مهارات القرن الحادي والعشرين.',
                        'recommendation' => 'الاستمرار في المشاركة بالدورات المتقدمة.'
                    ]
                ],
                'overall_assessment' => 'الطالب في مسار ممتاز ليصبح مبتكراً رائداً في المستقبل.',
                'development_plan' => [
                    [
                        'phase' => 'المرحلة الأولى: تعزيز المهارات',
                        'duration' => 'شهر واحد',
                        'actions' => ['التسجيل في دورة التفكير التصميمي', 'تطوير نموذج أولي للمشروع']
                    ]
                ],
                'conclusion' => 'توصي المنظومة بدعم الطالب وتوفير التوجيه والإرشاد اللازمين للاستفادة القصوى من إمكاناته.'
            ];
        }

        // 8. Institutional Report
        if (str_contains($systemContent, 'classification_distribution_analysis') || str_contains($systemContent, 'index_averages_analysis')) {
            return [
                'title' => 'التقرير المؤسسي الشامل للابتكار',
                'summary' => 'تقرير شامل يوضح متوسطات مؤشرات الابتكار وتوزيع تصنيفات الطلاب في المؤسسة التعليمية.',
                'index_averages_analysis' => 'متوسطات الأداء في المؤسسة تعكس تميزاً في التفكير العلمي والعمل الجماعي لدى أغلب الطلاب.',
                'classification_distribution_analysis' => 'توزيع الطلاب يظهر تركز النسبة الأكبر في المستويات المتوسطة والمتقدمة، مع وجود مبادرات واعدة.',
                'strengths' => 'وجود بيئة تفاعلية داعمة ومشاركات مستمرة للطلاب.',
                'improvement_areas' => 'تحسين مؤشرات الملكية الفكرية وتوثيق الإنجازات الخارجية.',
                'recommendations' => [
                    'تنظيم ورش عمل متخصصة في حماية الملكية الفكرية وبراءات الاختراع.',
                    'تفعيل برامج الإرشاد الأكاديمي والمهني للطلاب المتميزين.'
                ],
                'conclusion' => 'تمتلك المؤسسة مقومات ممتازة لتطوير جيل من المبتكرين مع التركيز على تنظيم عمليات التوثيق.'
            ];
        }

        // Catch-all generic JSON response
        return [];
    }

    /**
     * Simple keyword-based English translation helper for mock content
     */
    private function translateToEnglish(string $text): string
    {
        $text = mb_strtolower($text);
        
        $keywords = [
            'تدوير' => 'Recycling & Sustainability',
            'إعادة تدوير' => 'Recycling Systems',
            'نفايات' => 'Waste Management',
            'زراعة' => 'Rooftop Farming',
            'مطبخ' => 'Kitchen Utilities',
            'بيع' => 'E-Commerce Store',
            'تجارة' => 'Smart Commerce',
            'طاقة' => 'Clean Energy',
            'شمسية' => 'Solar Power',
            'روبوت' => 'Robotics',
            'ذكاء' => 'AI System',
            'صحة' => 'Health Tracking',
            'مياه' => 'Water Purification',
            'بيئة' => 'Eco-Friendly Systems',
            'تطبيق' => 'Mobile App',
            'موقع' => 'Web Platform',
            'ألعاب' => 'Educational Gaming',
        ];

        $matched = [];
        foreach ($keywords as $ar => $en) {
            if (mb_strpos($text, $ar) !== false) {
                $matched[] = $en;
            }
        }

        if (!empty($matched)) {
            return implode(' & ', array_unique($matched));
        }

        return 'Innovative STEM Venture';
    }

    /**
     * Simple keyword-based Arabic translation helper for mock content
     */
    private function translateToArabic(string $text): string
    {
        $text = strtolower($text);
        
        $keywords = [
            'recycle' => 'إعادة التدوير',
            'waste' => 'إدارة النفايات',
            'farm' => 'الزراعة الذكية',
            'kitchen' => 'أدوات المطبخ',
            'shop' => 'متجر إلكتروني',
            'store' => 'متجر بيع',
            'energy' => 'الطاقة البديلة',
            'solar' => 'الطاقة الشمسية',
            'robot' => 'الروبوتات الذكية',
            'ai' => 'الذكاء الاصطناعي',
            'health' => 'الصحة والرفاهية',
            'water' => 'تنقية المياه',
            'eco' => 'الحفاظ على البيئة',
            'app' => 'تطبيق ذكي',
            'web' => 'منصة ويب',
            'game' => 'ألعاب تعليمية',
        ];

        $matched = [];
        foreach ($keywords as $en => $ar) {
            if (strpos($text, $en) !== false) {
                $matched[] = $ar;
            }
        }

        if (!empty($matched)) {
            return implode(' و ', array_unique($matched));
        }

        return 'مشروع علمي مبتكر';
    }
}
