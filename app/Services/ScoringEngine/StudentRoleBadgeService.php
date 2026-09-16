<?php

namespace App\Services\ScoringEngine;

use App\Models\InnovationIndex;
use App\Models\User;

/**
 * Computes the student's "role badge" (سفير المعرفة / سفير التعلّم / سفير الابتكار)
 * from their latest InnovationIndex sub-scores plus a participation signal
 * (validated achievements). Requirement 1.2.
 *
 * The list is intentionally an array (not an enum) so a new role can be
 * added later just by appending a ROLES entry and a resolver branch —
 * no structural change needed elsewhere.
 */
class StudentRoleBadgeService
{
    public const ROLES = [
        'knowledge_ambassador' => [
            'label_ar' => 'سفير المعرفة',
            'label_en' => 'Knowledge Ambassador',
            'icon'     => '📚',
            'color'    => '#6366f1',
            'tooltip_ar' => 'يُمنح لمن يتفوّق في الذكاء والإبداع. لتطويره: أكمل تحديات تنمّي التفكير النقدي والإبداعي وارفع مؤشري الذكاء والإبداع.',
            'tooltip_en' => 'Awarded for strong intelligence and creativity scores. To grow it: complete challenges that build critical and creative thinking.',
        ],
        'learning_ambassador' => [
            'label_ar' => 'سفير التعلّم',
            'label_en' => 'Learning Ambassador',
            'icon'     => '🎓',
            'color'    => '#0ea5e9',
            'tooltip_ar' => 'يُمنح لمن يتفوّق في المهارات وإنجاز المشاريع بانتظام. لتطويره: أكمل مشاريع أكثر ووثّق مهاراتك الجديدة أولاً بأول.',
            'tooltip_en' => 'Awarded for strong skills and consistent project completion. To grow it: finish more projects and document new skills promptly.',
        ],
        'innovation_ambassador' => [
            'label_ar' => 'سفير الابتكار',
            'label_en' => 'Innovation Ambassador',
            'icon'     => '💡',
            'color'    => '#f59e0b',
            'tooltip_ar' => 'يُمنح لمن يتفوّق في الابتكار والملكية الفكرية والجاهزية المستقبلية. لتطويره: قدّم أفكاراً وابتكارات أصيلة ووثّقها كملكية فكرية.',
            'tooltip_en' => 'Awarded for strong innovation, IP, and future-readiness scores. To grow it: submit original ideas and document them as IP.',
        ],
    ];

    /**
     * @return array{key:string,label_ar:string,label_en:string,icon:string,color:string,tooltip_ar:string,tooltip_en:string}|null
     *         Null when the student has no calculated index yet, or the
     *         overall score is still too low to be meaningfully classified.
     */
    public function resolve(User $user): ?array
    {
        $index = $user->latestInnovationIndex;

        if (! $index || (float) $index->overall_score < 40) {
            return null;
        }

        $participationBonus = min(10, (int) $user->achievements()
            ->where('ai_validation_status', 'validated')
            ->count());

        $scores = [
            'knowledge_ambassador'  => ((float) $index->intelligence_index + (float) $index->creativity_index) / 2,
            'learning_ambassador'   => (((float) $index->skills_index + (float) $index->projects_index) / 2) + $participationBonus,
            'innovation_ambassador' => ((float) $index->innovation_index + (float) $index->ip_index + (float) $index->future_readiness_index) / 3,
        ];

        arsort($scores);
        $roleKey = array_key_first($scores);

        return array_merge(['key' => $roleKey], self::ROLES[$roleKey]);
    }
}
