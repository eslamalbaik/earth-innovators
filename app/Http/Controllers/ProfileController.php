<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Services\ProfileService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private ProfileService $profileService
    ) {}

    public function edit(Request $request): Response
    {
        $user = $request->user();
        $user->refresh();

        $data = $this->profileService->getProfileData($user);

        return Inertia::render('Profile', $data);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $updateData = $request->validated();

        $this->profileService->updateProfile(
            $user,
            $updateData,
            $request->hasFile('image') ? $request->file('image') : null
        );

        if ($user->isTeacher() && $request->has('teacher_data')) {
            $this->profileService->updateTeacherData(
                $user,
                $request->input('teacher_data', []),
                $request->hasFile('teacher_image') ? $request->file('teacher_image') : null
            );
        }

        return Redirect::route('profile.edit')
            ->with('success', 'تم تحديث الملف الشخصي بنجاح');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();
        $this->profileService->deleteProfile($user);

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/')->with('success', 'تم حذف الحساب بنجاح');
    }
}
