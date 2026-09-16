<?php

// Static academic reference lists used to validate student onboarding
// (requirement 5.1) — grade, section, and subjects become mandatory fields
// linked to the gradebook at registration time.

return [
    'curricula' => [
        'american'   => 'أمريكي',
        'british'    => 'بريطاني',
        'moe'        => 'وزارة التربية والتعليم',
    ],

    // الصفوف الدراسية (روضة إلى الصف الثاني عشر)
    'grades' => [
        'kg1', 'kg2',
        'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6',
        'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12',
    ],

    'subjects' => [
        'arabic'              => 'اللغة العربية',
        'english'             => 'اللغة الإنجليزية',
        'math'                => 'الرياضيات',
        'science'             => 'العلوم',
        'chemistry'           => 'الكيمياء',
        'physics'             => 'الفيزياء',
        'identity_values'     => 'الهوية والقيم والأسرة',
        'innovation_invention' => 'الابتكار والاختراع',
        'social_emotional'    => 'الذكاء الاجتماعي والعاطفي',
        'ai_future_tech'      => 'الذكاء الاصطناعي والتقنيات المستقبلية',
    ],
];
