<?php

namespace App\Exports;

use App\Models\Payment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class PaymentsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Payment::with(['student', 'package', 'userPackage'])->orderByDesc('id')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Student Name',
            'Student Email',
            'Package Name',
            'Amount',
            'Currency',
            'Status',
            'Payment Method',
            'Gateway',
            'Transaction ID',
            'Paid At',
            'Created At',
        ];
    }

    public function map($payment): array
    {
        return [
            $payment->id,
            $payment->student?->name,
            $payment->student?->email,
            $payment->package?->name_ar ?? $payment->package?->name,
            $payment->amount,
            $payment->currency,
            $payment->status,
            $payment->payment_method,
            $payment->payment_gateway,
            $payment->transaction_id,
            $payment->paid_at?->format('Y-m-d H:i'),
            $payment->created_at?->format('Y-m-d H:i'),
        ];
    }
}