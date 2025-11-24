<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\UserPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $packages = Package::where('is_active', true)
            ->orderBy('price')
            ->get();

        $userPackage = null;
        if ($request->user()) {
            $userPackage = UserPackage::where('user_id', $request->user()->id)
                ->where('status', 'active')
                ->with('package')
                ->first();
        }

        return Inertia::render('Packages', [
            'packages' => $packages,
            'userPackage' => $userPackage,
        ]);
    }

    public function show($id)
    {
        $package = Package::findOrFail($id);

        $userPackage = null;
        if (auth()->check()) {
            $userPackage = UserPackage::where('user_id', auth()->id())
                ->where('package_id', $id)
                ->where('status', 'active')
                ->first();
        }

        return Inertia::render('Packages/Show', [
            'package' => $package,
            'userPackage' => $userPackage,
        ]);
    }
}
