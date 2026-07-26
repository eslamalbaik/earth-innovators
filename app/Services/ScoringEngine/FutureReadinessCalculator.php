<?php

namespace App\Services\ScoringEngine;

use App\Models\User;
use App\Models\UserSkill;

/**
 * AI-012: Future Readiness Index Calculator (0-100)
 *
 * المدخلات: الذكاء الاصطناعي، المهارات الرقمية، التعلم المستمر، التكنولوجيا الحديثة
 */
class FutureReadinessCalculator
{
    /**
     * Keywords that indicate future-readiness in skills
     */
    private const FUTURE_KEYWORDS = [
        'ai', 'artificial intelligence', 'machine learning', 'deep learning',
        'الذكاء الاصطناعي', 'تعلم الآلة', 'التعلم العميق',
        'blockchain', 'بلوكتشين',
        'cloud', 'السحابة', 'aws', 'azure', 'gcp',
        'data science', 'علم البيانات', 'big data', 'البيانات الضخمة',
        'cybersecurity', 'الأمن السيبراني',
        'iot', 'إنترنت الأشياء',
        'robotics', 'الروبوتات',
        'python', 'javascript', 'react', 'node',
        'automation', 'الأتمتة',
        'digital', 'رقمي',
        'agile', 'scrum', 'devops',
        '3d printing', 'الطباعة ثلاثية الأبعاد',
        'vr', 'ar', 'metaverse', 'الواقع الافتراضي',
        'quantum', 'الحوسبة الكمومية',
    ];

    public function calculate(User $user, array &$metadata): float
    {
        $skills = $user->userSkills;
        $achievements = $user->achievements;

        // 1. Future-Ready Skills (0-30)
        $futureSkills = $skills->filter(function (UserSkill $skill) {
            $name = mb_strtolower($skill->name);
            foreach (self::FUTURE_KEYWORDS as $keyword) {
                if (str_contains($name, $keyword)) {
                    return true;
                }
            }
            return false;
        });
        $futureSkillsScore = min(30, $futureSkills->count() * 5);

        // 2. Digital Certifications (0-25)
        $digitalCerts = $achievements->where('type', 'certificate')
            ->filter(function ($a) {
                $title = mb_strtolower($a->title);
                foreach (self::FUTURE_KEYWORDS as $keyword) {
                    if (str_contains($title, $keyword)) {
                        return true;
                    }
                }
                return false;
            });
        $digitalCertsScore = min(25, $digitalCerts->count() * 8);

        // 3. Continuous Learning (0-25)
        // Measured by recent achievements (last 12 months)
        $recentAchievements = $achievements->filter(
            fn($a) => $a->date && $a->date->isAfter(now()->subMonths(12))
        )->count();
        $continuousLearningScore = min(25, $recentAchievements * 4);

        // 4. Technology Projects (0-20)
        $techProjects = $achievements->where('type', 'project')
            ->filter(function ($a) {
                $desc = mb_strtolower($a->description ?? '');
                $title = mb_strtolower($a->title);
                foreach (self::FUTURE_KEYWORDS as $keyword) {
                    if (str_contains($desc, $keyword) || str_contains($title, $keyword)) {
                        return true;
                    }
                }
                return false;
            });
        $techProjectsScore = min(20, $techProjects->count() * 7);

        $total = round(min(100, $futureSkillsScore + $digitalCertsScore + $continuousLearningScore + $techProjectsScore), 2);

        $metadata['future_readiness'] = [
            'future_skills_score'       => round($futureSkillsScore, 2),
            'digital_certs_score'       => round($digitalCertsScore, 2),
            'continuous_learning_score' => round($continuousLearningScore, 2),
            'tech_projects_score'       => round($techProjectsScore, 2),
            'future_ready_skills_count' => $futureSkills->count(),
            'recent_achievements'       => $recentAchievements,
        ];

        return $total;
    }
}
