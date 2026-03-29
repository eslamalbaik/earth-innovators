<?php

/**
 * مكافآت متجر النقاط — احتياطي عندما لا يوجد صفوف في جدول store_rewards.
 * الإدارة: /admin/store-rewards وطلبات الموافقة /admin/store-reward-requests
 * status في الواجهة: available | insufficient | locked (يتطلب اشتراكاً، إلخ)
 */
return [
    'weekly_redemption_limit' => (int) env('STORE_REWARD_WEEKLY_LIMIT', 1),

    'items' => [
        [
            'id' => 'digital_card',
            'points' => 1000,
            'icon' => '🃏',
            'name_key' => 'storeMembershipPage.items.digitalCard.name',
            'sort' => 1,
            'active' => true,
        ],
        [
            'id' => 'creative_tools',
            'points' => 1500,
            'icon' => '🎨',
            'name_key' => 'storeMembershipPage.items.creativeTools.name',
            'sort' => 2,
            'active' => true,
        ],
        [
            'id' => 'snack_voucher',
            'points' => 800,
            'icon' => '🍕',
            'name_key' => 'storeMembershipPage.items.snackVoucher.name',
            'sort' => 3,
            'active' => true,
        ],
        [
            'id' => 'workshop_access',
            'points' => 1200,
            'icon' => '🎫',
            'name_key' => 'storeMembershipPage.items.workshopAccess.name',
            'sort' => 4,
            'active' => true,
        ],
        [
            'id' => 'smart_box',
            'points' => 900,
            'icon' => '🎁',
            'name_key' => 'storeMembershipPage.items.smartBox.name',
            'sort' => 5,
            'active' => true,
        ],
    ],
];
