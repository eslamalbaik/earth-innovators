<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureMembershipActive;
use App\Models\Achievement;
use App\Models\InnovationIndex;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StudentAssistantControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_student_cannot_use_the_assistant(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $teacher = User::factory()->create(['role' => 'teacher']);

        $response = $this->actingAs($teacher)->postJson('/student/assistant/ask', [
            'question' => 'مرحباً',
        ]);

        $response->assertForbidden();
    }

    public function test_student_without_calculated_indexes_gets_a_no_data_message_instead_of_a_generic_answer(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($student)->postJson('/student/assistant/ask', [
            'question' => 'لماذا حصلت على هذه الدرجة في الابتكار؟',
        ]);

        $response->assertOk();
        $response->assertJson(['mode' => 'no_data']);
    }

    public function test_score_explanation_cites_the_students_own_documented_indicators_and_achievements(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $student = User::factory()->create(['role' => 'student']);

        Achievement::create([
            'user_id' => $student->id,
            'title' => 'مشروع الطاقة الشمسية الذكي',
            'description' => 'نموذج أولي لتوليد الطاقة الشمسية',
            'type' => 'project',
            'category' => 'science',
            'date' => now(),
            'ai_validation_status' => 'validated',
        ]);

        InnovationIndex::create([
            'user_id' => $student->id,
            'skills_index' => 40,
            'innovation_index' => 37,
            'intelligence_index' => 30,
            'creativity_index' => 45,
            'projects_index' => 50,
            'leadership_index' => 20,
            'ip_index' => 10,
            'future_readiness_index' => 25,
            'overall_score' => 32.5,
            'classification' => 'developing',
            'calculation_metadata' => [
                'innovation' => [
                    'projects_score' => 8,
                    'awards_score' => 0,
                    'ideas_score' => 0,
                    'patents_score' => 0,
                    'innovative_projects' => 1,
                    'total_awards' => 0,
                    'total_patents' => 0,
                ],
            ],
            'calculated_at' => now(),
        ]);

        $response = $this->actingAs($student)->postJson('/student/assistant/ask', [
            'question' => 'لماذا حصلت على 37 في الابتكار؟',
        ]);

        $response->assertOk();
        $response->assertJson(['mode' => 'index_explanation', 'index' => 'innovation']);

        $answer = $response->json('answer');

        $this->assertStringContainsString('37', $answer);
        $this->assertStringContainsString('مشروع الطاقة الشمسية الذكي', $answer);
        $this->assertStringContainsString('8/30', $answer);
    }

    public function test_overall_score_question_breaks_down_all_eight_weighted_indexes(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $student = User::factory()->create(['role' => 'student']);

        InnovationIndex::create([
            'user_id' => $student->id,
            'skills_index' => 40,
            'innovation_index' => 37,
            'intelligence_index' => 30,
            'creativity_index' => 45,
            'projects_index' => 50,
            'leadership_index' => 20,
            'ip_index' => 10,
            'future_readiness_index' => 25,
            'overall_score' => 32.5,
            'classification' => 'developing',
            'calculation_metadata' => [],
            'calculated_at' => now(),
        ]);

        $response = $this->actingAs($student)->postJson('/student/assistant/ask', [
            'question' => 'لماذا درجتي الإجمالية منخفضة؟',
        ]);

        $response->assertOk();
        $response->assertJson(['mode' => 'index_explanation', 'index' => 'overall']);
        $this->assertStringContainsString('32.5', $response->json('answer'));
    }

    /**
     * Regression: "مشروع" (project) is also an index-keyword trigger, but a
     * platform how-to question that merely mentions "project" is not a score
     * question and must not be hijacked into a Projects index breakdown.
     */
    public function test_platform_how_to_question_is_not_hijacked_into_a_score_explanation(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($this->fakeGeminiTextBody('انتقل إلى صفحة مشاريعي واضغط على "إنشاء مشروع جديد".'), 200),
        ]);

        $student = User::factory()->create(['role' => 'student']);
        InnovationIndex::create($this->minimalIndexAttributes($student->id));

        $response = $this->actingAs($student)->postJson('/student/assistant/ask', [
            'question' => 'كيف أضيف مشروعاً جديداً في المنصة؟',
        ]);

        $response->assertOk();
        $response->assertJson(['mode' => 'general']);
        $this->assertStringNotContainsString('📊', $response->json('answer'));
    }

    /**
     * Regression: the platform's own name "مبتكرو الأرض" contains "مبتكر",
     * which also matches the "innovation" index keyword — asking what the
     * platform is must not be hijacked into an Innovation score breakdown.
     */
    public function test_platform_name_mention_is_not_hijacked_into_innovation_score_explanation(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($this->fakeGeminiTextBody('مبتكرو الأرض منصة تعليمية للطلاب والمعلمين.'), 200),
        ]);

        $student = User::factory()->create(['role' => 'student']);
        InnovationIndex::create($this->minimalIndexAttributes($student->id));

        $response = $this->actingAs($student)->postJson('/student/assistant/ask', [
            'question' => 'ما هي منصة مبتكرو الأرض؟',
        ]);

        $response->assertOk();
        $response->assertJson(['mode' => 'general']);
        $this->assertStringNotContainsString('📊', $response->json('answer'));
    }

    /**
     * Regression: GeminiClient::chat() silently substitutes a hardcoded
     * "analysis successful" filler on failure instead of returning null.
     * The assistant must detect that and tell the student honestly, not
     * forward a canned sentence unrelated to what they asked.
     */
    public function test_general_answer_shows_an_honest_busy_message_when_gemini_is_overloaded(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response(['error' => ['code' => 503, 'message' => 'overloaded']], 503),
        ]);

        $student = User::factory()->create(['role' => 'student']);
        InnovationIndex::create($this->minimalIndexAttributes($student->id));

        $response = $this->actingAs($student)->postJson('/student/assistant/ask', [
            'question' => 'كيف أشارك في تحدٍّ؟',
        ]);

        $response->assertOk();
        $response->assertJson(['mode' => 'general']);
        $answer = $response->json('answer');
        $this->assertStringNotContainsString('تم تحليل البيانات ومراجعتها بنجاح', $answer);
        $this->assertStringContainsString('غير متاحة مؤقتاً', $answer);
    }

    private function fakeGeminiTextBody(string $text): array
    {
        return [
            'candidates' => [[
                'content'      => ['parts' => [['text' => $text]]],
                'finishReason' => 'STOP',
            ]],
            'usageMetadata' => ['totalTokenCount' => 42],
        ];
    }

    private function minimalIndexAttributes(int $userId): array
    {
        return [
            'user_id' => $userId,
            'skills_index' => 40,
            'innovation_index' => 37,
            'intelligence_index' => 30,
            'creativity_index' => 45,
            'projects_index' => 50,
            'leadership_index' => 20,
            'ip_index' => 10,
            'future_readiness_index' => 25,
            'overall_score' => 32.5,
            'classification' => 'developing',
            'calculation_metadata' => [],
            'calculated_at' => now(),
        ];
    }
}
