<?php

namespace App\Support;

/**
 * Single source of truth for the 7 base-role Arabic labels, mirroring
 * resources/js/i18n/ar.js `roles.*`. Used by anything rendering a role
 * name server-side (CSV export, admin permission labels, User::roleLabel()).
 */
class RoleLabels
{
    private const LABELS = [
        'system_supervisor' => 'مشرف النظام',
        'school_support_coordinator' => 'منسق دعم المؤسسات التعليمية',
        'admin' => 'أدمن',
        'teacher' => 'معلم',
        'student' => 'طالب',
        'school' => 'مدرسة',
        'educational_institution' => 'مؤسسة تعليمية',
    ];

    public static function label(string $role): string
    {
        return self::LABELS[$role] ?? $role;
    }
}
