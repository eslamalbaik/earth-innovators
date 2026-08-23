<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AIEngine\GeminiClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;
use Tests\TestCase;

class AIArticleGenerationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // The retry backoff in GeminiClient really sleeps between attempts;
        // fake it so exhausted-retry tests don't take ~35s each.
        Sleep::fake();
    }

    /**
     * One row per role: [role, generate route name, extra user attributes].
     */
    public static function publicationRoleProvider(): array
    {
        return [
            'teacher' => ['teacher', 'teacher.publications.generate', []],
            'school'  => ['school', 'school.publications.generate', []],
            'admin'   => ['admin', 'admin.publications.generate', []],
        ];
    }

    private function fakeGeminiSuccessBody(): array
    {
        $payload = [
            'content'         => '<h2>Innovation</h2><p>English body.</p>',
            'content_ar'      => '<h2>الابتكار</h2><p>محتوى عربي.</p>',
            'title'           => 'Innovation in Education',
            'title_ar'        => 'الابتكار في التعليم',
            'description'     => 'Short EN description.',
            'description_ar'  => 'وصف قصير بالعربية.',
            'image_keyword'   => 'education',
        ];

        return [
            'candidates' => [[
                'content'      => ['parts' => [['text' => json_encode($payload)]]],
                'finishReason' => 'STOP',
            ]],
            'usageMetadata' => ['totalTokenCount' => 1234],
        ];
    }

    private function fakeUnsplashSuccessBody(): array
    {
        return [
            'results' => [
                ['urls' => ['regular' => 'https://images.unsplash.com/photo-fake.jpg']],
            ],
        ];
    }

    private function fakeGemini503Body(): array
    {
        return [
            'error' => ['code' => 503, 'message' => 'This model is currently experiencing high demand.'],
        ];
    }

    private function fakeGemini429Body(): array
    {
        return [
            'error' => [
                'code'    => 429,
                'status'  => 'RESOURCE_EXHAUSTED',
                'message' => 'You exceeded your current quota, please check your plan and billing details.',
            ],
        ];
    }

    /** @dataProvider publicationRoleProvider */
    public function test_generate_returns_ai_content_on_success(string $role, string $routeName): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($this->fakeGeminiSuccessBody(), 200),
            'api.unsplash.com/*'                  => Http::response($this->fakeUnsplashSuccessBody(), 200),
        ]);

        $user = User::factory()->create(['role' => $role, 'membership_type' => 'basic']);

        $response = $this->actingAs($user)->postJson(route($routeName), [
            'title' => 'Innovation in Education',
        ]);

        $response->assertOk();
        $response->assertJson([
            'title'      => 'Innovation in Education',
            'title_ar'   => 'الابتكار في التعليم',
            'content'    => '<h2>Innovation</h2><p>English body.</p>',
            'content_ar' => '<h2>الابتكار</h2><p>محتوى عربي.</p>',
            'image_url'  => 'https://images.unsplash.com/photo-fake.jpg',
        ]);

        Http::assertSentCount(2);
    }

    /** @dataProvider publicationRoleProvider */
    public function test_generate_requires_a_title(string $role, string $routeName): void
    {
        Http::fake();

        $user = User::factory()->create(['role' => $role, 'membership_type' => 'basic']);

        $response = $this->actingAs($user)->postJson(route($routeName), []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('title');
        Http::assertNothingSent();
    }

    /**
     * Reproduces the reported bug: Gemini overloaded (503) on every attempt
     * exhausts the retry budget and the endpoint must fail with the documented
     * error contract instead of a 500 crash.
     *
     * @dataProvider publicationRoleProvider
     */
    public function test_generate_surfaces_error_when_gemini_is_persistently_overloaded(string $role, string $routeName): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($this->fakeGemini503Body(), 503),
        ]);

        $user = User::factory()->create(['role' => $role, 'membership_type' => 'basic']);

        $response = $this->actingAs($user)->postJson(route($routeName), [
            'title' => 'Innovation in Education',
        ]);

        $response->assertStatus(500);
        $response->assertJson(['error' => 'فشل في توليد المحتوى من الذكاء الاصطناعي.']);
    }

    /**
     * A single request that recovers after transient overload should still
     * succeed end-to-end through the controller (validates the retry fix,
     * not just the GeminiClient unit behaviour).
     */
    public function test_teacher_generate_recovers_after_transient_overload(): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::sequence()
                ->push($this->fakeGemini503Body(), 503)
                ->push($this->fakeGemini503Body(), 503)
                ->push($this->fakeGeminiSuccessBody(), 200),
            'api.unsplash.com/*' => Http::response($this->fakeUnsplashSuccessBody(), 200),
        ]);

        $user = User::factory()->create(['role' => 'teacher', 'membership_type' => 'basic']);

        $response = $this->actingAs($user)->postJson(route('teacher.publications.generate'), [
            'title' => 'Innovation in Education',
        ]);

        $response->assertOk();
        $response->assertJsonPath('title_ar', 'الابتكار في التعليم');
    }

    public function test_client_does_not_waste_retries_on_daily_quota_exhaustion(): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($this->fakeGemini429Body(), 429),
        ]);

        $result = app(GeminiClient::class)->chat([
            GeminiClient::userMessage('hello'),
        ]);

        $this->assertNull($result);
        // Quota exhaustion is a daily cap, not a blip — retrying burns time
        // for nothing, so the client must give up after a single attempt.
        Http::assertSentCount(1);
    }

    public function test_client_retries_transient_overload_up_to_six_times_then_gives_up(): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($this->fakeGemini503Body(), 503),
        ]);

        $result = app(GeminiClient::class)->chat([
            GeminiClient::userMessage('hello'),
        ]);

        $this->assertNull($result);
        Http::assertSentCount(6);
    }

    public function test_client_stops_retrying_once_a_later_attempt_succeeds(): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::sequence()
                ->push($this->fakeGemini503Body(), 503)
                ->push(['candidates' => [['content' => ['parts' => [['text' => 'hi']]]]]], 200),
        ]);

        $result = app(GeminiClient::class)->chat([
            GeminiClient::userMessage('hello'),
        ]);

        $this->assertSame('hi', $result);
        Http::assertSentCount(2);
    }
}
