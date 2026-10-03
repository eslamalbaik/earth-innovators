<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;
use Tests\TestCase;

class AIChallengeGenerationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sleep::fake();
    }

    public static function challengeRoleProvider(): array
    {
        return [
            'admin'  => ['admin', 'admin.challenges.generate'],
            'school' => ['school', 'school.challenges.generate'],
        ];
    }

    private function fakeGeminiChallengeBody(): array
    {
        $payload = [
            'title'           => 'Windows Copy Sales Challenge',
            'title_ar'        => 'تحدي بيع نسخ ويندوز',
            'objective'       => 'Build sales skills.',
            'objective_ar'    => 'بناء مهارات البيع.',
            'description'     => 'EN description.',
            'description_ar'  => 'وصف عربي.',
            'instructions'    => "Step 1\nStep 2",
            'instructions_ar' => "الخطوة 1\nالخطوة 2",
            'category'        => 'technology',
            'image_keyword'   => 'laptop software sales',
            'criteria'        => [
                ['name_ar' => 'الإبداع', 'weight' => 50],
                ['name_ar' => 'التنفيذ', 'weight' => 50],
            ],
        ];

        return [
            'candidates' => [[
                'content'      => ['parts' => [['text' => json_encode($payload)]]],
                'finishReason' => 'STOP',
            ]],
        ];
    }

    /** @dataProvider challengeRoleProvider */
    public function test_generate_returns_bilingual_challenge_details(string $role, string $routeName): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($this->fakeGeminiChallengeBody(), 200),
        ]);

        $user = User::factory()->create(['role' => $role, 'membership_type' => 'basic']);

        $response = $this->actingAs($user)->postJson(route($routeName), [
            'idea' => 'تحدي بيع نسخ ويندوز',
        ]);

        $response->assertOk();
        $response->assertJson([
            'title'           => 'Windows Copy Sales Challenge',
            'title_ar'        => 'تحدي بيع نسخ ويندوز',
            'instructions_ar' => "الخطوة 1\nالخطوة 2",
            'category'        => 'technology',
            'incomplete_fields' => [],
        ]);
        $this->assertCount(2, $response->json('suggested_criteria'));
    }

    /**
     * Regression: a 2048-token cap truncated the bilingual challenge JSON mid-string,
     * producing "فشل في توليد تفاصيل التحدي من الذكاء الاصطناعي".
     */
    public function test_generate_requests_enough_output_tokens_for_bilingual_json(): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($this->fakeGeminiChallengeBody(), 200),
        ]);

        $admin = User::factory()->create(['role' => 'admin', 'membership_type' => 'basic']);

        $this->actingAs($admin)->postJson(route('admin.challenges.generate'), [
            'idea' => 'تحدي بيع نسخ ويندوز',
        ])->assertOk();

        Http::assertSent(fn (Request $request) =>
            str_contains($request->url(), 'generativelanguage.googleapis.com')
            && ($request['generationConfig']['maxOutputTokens'] ?? 0) >= 8192
        );
    }
}
