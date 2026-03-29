<?php

/**
 * عرض صفحة الإنجازات — مستويات وشرح توزيع النقاط (يمكن ربطها لاحقاً بجدول إعدادات).
 */
return [
    'learner_levels' => [
        ['title_key' => 'achievementsPage.levels.communityPioneer.title', 'points_key' => 'achievementsPage.levels.communityPioneer.points', 'gradient' => 'from-pink-500 to-green-500', 'right_icon' => '❤️', 'left_icon' => 'heart'],
        ['title_key' => 'achievementsPage.levels.inspiringInProgress.title', 'points_key' => 'achievementsPage.levels.inspiringInProgress.points', 'gradient' => 'from-green-500 to-purple-500', 'right_icon' => '🧭', 'left_icon' => 'bug'],
        ['title_key' => 'achievementsPage.levels.creativeChangeMaker.title', 'points_key' => 'achievementsPage.levels.creativeChangeMaker.points', 'gradient' => 'from-yellow-500 to-blue-500', 'right_icon' => '🚀', 'left_icon' => 'rocket'],
        ['title_key' => 'achievementsPage.levels.creativeLeader.title', 'points_key' => 'achievementsPage.levels.creativeLeader.points', 'gradient' => 'from-purple-500 to-purple-700', 'right_icon' => '🧠', 'left_icon' => 'brain'],
    ],
    'points_distribution' => [
        ['type_key' => 'achievementsPage.pointsDistribution.simpleParticipation', 'icon' => '✏️', 'points_key' => 'achievementsPage.pointsDistribution.simpleParticipationPoints', 'multiplier_count' => 10, 'total' => 20, 'color' => 'bg-green-100', 'icon_bg' => 'bg-green-100'],
        ['type_key' => 'achievementsPage.pointsDistribution.moderateTask', 'icon' => '🔧', 'points_key' => 'achievementsPage.pointsDistribution.moderateTaskPoints', 'multiplier_count' => 8, 'total' => 48, 'color' => 'bg-blue-100', 'icon_bg' => 'bg-blue-100'],
        ['type_key' => 'achievementsPage.pointsDistribution.communityInitiative', 'icon' => '▼', 'points_key' => 'achievementsPage.pointsDistribution.communityInitiativePoints', 'multiplier_count' => 5, 'total' => 40, 'color' => 'bg-purple-100', 'icon_bg' => 'bg-purple-100'],
        ['type_key' => 'achievementsPage.pointsDistribution.impactfulProject', 'icon' => '🚀', 'points_key' => 'achievementsPage.pointsDistribution.impactfulProjectPoints', 'multiplier_count' => 3, 'total' => 30, 'color' => 'bg-orange-100', 'icon_bg' => 'bg-orange-100'],
    ],
];
