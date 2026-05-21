<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Services\ProfileService;
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
        // #region agent log
        @file_put_contents(base_path('debug-75cfd5.log'), json_encode(['sessionId' => '75cfd5', 'hypothesisId' => 'H2', 'location' => 'ProfileController::update', 'message' => 'update_entered', 'data' => ['userId' => $request->user()?->id, 'role' => $request->user()?->role, 'hasName' => $request->has('name'), 'hasEmail' => $request->has('email'), 'method' => $request->method()], 'timestamp' => (int) (microtime(true) * 1000)]) . "\n", FILE_APPEND);
        // #endregion
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

        if ($user->isStudent()) {
            return Redirect::route('student.profile')
                ->with('success', 'تم تحديث الملف الشخصي بنجاح.');
        }

        if ($user->isTeacher()) {
            return Redirect::route('teacher.profile')
                ->with('success', 'تم تحديث الملف الشخصي بنجاح.');
        }

        // #region agent log
        @file_put_contents(base_path('debug-75cfd5.log'), json_encode(['sessionId' => '75cfd5', 'hypothesisId' => 'H2', 'location' => 'ProfileController::update', 'message' => 'update_success_redirect', 'data' => ['userId' => $user->id, 'emailChanged' => isset($updateData['email']) && $updateData['email'] !== $user->email], 'timestamp' => (int) (microtime(true) * 1000)]) . "\n", FILE_APPEND);
        // #endregion

        return Redirect::route('profile.edit')
            ->with('success', 'تم تحديث الملف الشخصي بنجاح.');
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

        return Redirect::to('/')->with('success', 'تم حذف الحساب بنجاح.');
    }
}
