<?php

namespace App\Services\AIEngine;

use App\Models\User;
use App\Models\UserSkill;

/**
 * AI-004: Entity Extractor
 *
 * Extracts skills, technologies, tools, languages, institutions, and specializations
 * from achievement content and syncs them to user profile.
 */
class EntityExtractor
{
    public function __construct(
        private DeepSeekClient $client,
    ) {}

    /**
     * Extract all entities from content
     */
    public function extractAll(string $content): array
    {
        $result = $this->client->chatWithJson([
            DeepSeekClient::systemMessage(
                'أنت خبير في استخراج الكيانات من النصوص. قم باستخراج الكيانات التالية من النص المقدم: '
                . 'skills (مهارات)، technologies (تقنيات)، tools (أدوات)، '
                . 'languages (لغات برمجة أو لغات طبيعية)، institutions (مؤسسات)، '
                . 'specializations (تخصصات). '
                . 'كل كيان يجب أن يكون كائن JSON يحتوي على: name (string)، category (string)، '
                . 'proficiency_level (beginner/intermediate/advanced/expert). '
                . 'أجب بصيغة JSON فقط مع حقول: skills, technologies, tools, languages, institutions, specializations.'
            ),
            DeepSeekClient::userMessage($content),
        ]);

        return $result ?? [
            'skills'          => [],
            'technologies'    => [],
            'tools'           => [],
            'languages'       => [],
            'institutions'    => [],
            'specializations' => [],
        ];
    }

    /**
     * Extract entities and sync to user profile
     */
    public function extractAndSync(User $user, string $content, ?int $achievementId = null): array
    {
        $entities = $this->extractAll($content);
        $synced = [];

        // Merge skills, technologies, and tools into UserSkills
        $allSkills = array_merge(
            $this->mapToSkills($entities['skills'] ?? [], 'مهارة'),
            $this->mapToSkills($entities['technologies'] ?? [], 'تقنية'),
            $this->mapToSkills($entities['tools'] ?? [], 'أداة'),
            $this->mapToSkills($entities['languages'] ?? [], 'لغة'),
        );

        foreach ($allSkills as $skillData) {
            // Avoid duplicates
            $existing = $user->userSkills()
                ->where('name', $skillData['name'])
                ->first();

            if (!$existing) {
                $skill = $user->userSkills()->create([
                    'name'             => $skillData['name'],
                    'category'         => $skillData['category'],
                    'source'           => 'ai_extracted',
                    'proficiency_level' => $skillData['proficiency_level'] ?? 'beginner',
                    'achievement_id'   => $achievementId,
                ]);
                $synced[] = $skill->name;
            }
        }

        return [
            'extracted'       => $entities,
            'synced_skills'   => $synced,
            'total_synced'    => count($synced),
        ];
    }

    /**
     * Map extracted entities to skill format
     */
    private function mapToSkills(array $items, string $defaultCategory): array
    {
        return array_map(function ($item) use ($defaultCategory) {
            if (is_string($item)) {
                return [
                    'name'             => $item,
                    'category'         => $defaultCategory,
                    'proficiency_level' => 'beginner',
                ];
            }

            return [
                'name'             => $item['name'] ?? $item,
                'category'         => $item['category'] ?? $defaultCategory,
                'proficiency_level' => $item['proficiency_level'] ?? 'beginner',
            ];
        }, $items);
    }
}
