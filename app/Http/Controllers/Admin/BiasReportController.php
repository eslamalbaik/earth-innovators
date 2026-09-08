<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AIEngine\BiasMeasurementService;
use Inertia\Inertia;
use Inertia\Response;

class BiasReportController extends Controller
{
    public function __construct(private BiasMeasurementService $biasMeasurementService) {}

    public function index(): Response
    {
        return Inertia::render('Admin/AiEthics/BiasReport', [
            'report' => $this->biasMeasurementService->schoolFairnessReport(),
        ]);
    }
}
