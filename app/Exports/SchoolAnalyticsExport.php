<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SchoolAnalyticsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(private \Illuminate\Support\Collection $indexes) {}

    public function collection()
    {
        return $this->indexes;
    }

    public function headings(): array
    {
        return [
            'Student Name', 'Overall Score', 'National Level',
            'Skills', 'Innovation', 'Intelligence', 'Creativity',
            'Projects', 'Leadership', 'IP', 'Future Readiness', 'Calculated At',
        ];
    }

    public function map($index): array
    {
        $user = User::find($index->user_id);
        $level = $index->getNationalLevelDetails();

        return [
            $user?->name,
            round((float) $index->overall_score, 1),
            $level ? "{$level['code']} - {$level['label_ar']}" : '',
            $index->skills_index,
            $index->innovation_index,
            $index->intelligence_index,
            $index->creativity_index,
            $index->projects_index,
            $index->leadership_index,
            $index->ip_index,
            $index->future_readiness_index,
            $index->calculated_at,
        ];
    }
}
