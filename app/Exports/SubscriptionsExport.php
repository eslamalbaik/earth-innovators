<?php

namespace App\Exports;

use App\Models\UserPackage;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SubscriptionsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return UserPackage::with(['user', 'package'])->orderByDesc('id')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'User Name',
            'User Email',
            'User Role',
            'Package Name',
            'Package Type',
            'Status',
            'Start Date',
            'End Date',
            'Auto Renew',
            'Paid Amount',
            'Payment Method',
            'Created At',
        ];
    }

    public function map($subscription): array
    {
        return [
            $subscription->id,
            $subscription->user?->name,
            $subscription->user?->email,
            $subscription->user?->role,
            $subscription->package?->name_ar ?? $subscription->package?->name,
            $subscription->package?->duration_type,
            $subscription->status,
            $subscription->start_date?->format('Y-m-d'),
            $subscription->end_date?->format('Y-m-d'),
            $subscription->auto_renew ? 'Yes' : 'No',
            $subscription->paid_amount,
            $subscription->payment_method,
            $subscription->created_at?->format('Y-m-d H:i'),
        ];
    }
}