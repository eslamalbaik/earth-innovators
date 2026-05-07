<?php

namespace App\Exports;

use App\Models\Package;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class PackagesExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Package::with('userPackages')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name (AR)',
            'Name (EN)',
            'Duration Type',
            'Duration (Months)',
            'Price',
            'Currency',
            'Is Active',
            'Is Trial',
            'Trial Days',
            'Points Bonus',
            'Total Subscribers',
        ];
    }

    public function map($package): array
    {
        return [
            $package->id,
            $package->name_ar,
            $package->name,
            $package->duration_type,
            $package->duration_months,
            $package->price,
            $package->currency,
            $package->is_active ? 'Yes' : 'No',
            $package->is_trial ? 'Yes' : 'No',
            $package->trial_days,
            $package->points_bonus,
            $package->userPackages()->count(),
        ];
    }
}