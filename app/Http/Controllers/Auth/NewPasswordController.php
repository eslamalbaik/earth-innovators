<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\PasswordResetService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    public function __construct(
        private PasswordResetService $passwordResetService
    ) {}

    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // #region agent log
        file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D','location'=>'NewPasswordController.php:30','message'=>'store method entry','data'=>['has_token'=>!empty($request->token),'has_email'=>!empty($request->email),'has_password'=>!empty($request->password),'password_length'=>strlen($request->password??'')],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
        // #endregion

        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // #region agent log
        file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D','location'=>'NewPasswordController.php:36','message'=>'Validation passed','data'=>['token'=>$request->token,'email'=>$request->email],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
        // #endregion

        try {
            // Reset password using JWT token
            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D','location'=>'NewPasswordController.php:40','message'=>'Before resetPassword call','data'=>['token'=>$request->token,'ip'=>$request->ip()],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion

            $success = $this->passwordResetService->resetPassword(
                $request->token,
                $request->password,
                $request->ip()
            );

            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D','location'=>'NewPasswordController.php:47','message'=>'After resetPassword call','data'=>['success'=>$success],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion

            if (!$success) {
                // #region agent log
                file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D','location'=>'NewPasswordController.php:50','message'=>'resetPassword returned false','data':[],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
                // #endregion
                throw ValidationException::withMessages([
                    'email' => ['رمز إعادة التعيين غير صحيح أو منتهي الصلاحية.'],
                ]);
            }

            // Get user from token
            $user = $this->passwordResetService->verifyToken($request->token);
            
            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D','location'=>'NewPasswordController.php:58','message'=>'User verification','data'=>['has_user'=>!is_null($user),'user_id'=>$user?->id],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion
            
            if ($user) {
                // Fire password reset event
                event(new PasswordReset($user));
            }

            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D','location'=>'NewPasswordController.php:65','message'=>'Before redirect to login','data':[],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion

            return redirect()->route('login')->with('status', 'تم إعادة تعيين كلمة المرور بنجاح.');
        } catch (\Exception $e) {
            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D','location'=>'NewPasswordController.php:70','message'=>'Exception caught','data'=>['exception_message'=>$e->getMessage(),'exception_class'=>get_class($e)],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion
            throw ValidationException::withMessages([
                'email' => ['حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.'],
            ]);
        }
    }
}