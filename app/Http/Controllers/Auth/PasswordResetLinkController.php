<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\PasswordResetService;
use App\Services\EmailService;
use App\Models\User;
use App\Mail\PasswordResetMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function __construct(
        private PasswordResetService $passwordResetService,
        private EmailService $emailService
    ) {}

    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // #region agent log
        file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'E','location'=>'PasswordResetLinkController.php:32','message'=>'Function entry - store method','data'=>['email'=>$request->email],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
        // #endregion

        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // #region agent log
        file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'E','location'=>'PasswordResetLinkController.php:38','message'=>'Validation passed','data'=>['email'=>$request->email],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
        // #endregion

        try {
            $user = User::where('email', $request->email)->first();

            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'E','location'=>'PasswordResetLinkController.php:43','message'=>'User lookup result','data'=>['user_found'=>$user!==null,'user_id'=>$user?->id],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion

            if (!$user) {
                throw ValidationException::withMessages([
                    'email' => ['لا يمكننا العثور على مستخدم بهذا البريد الإلكتروني.'],
                ]);
            }

            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'A','location'=>'PasswordResetLinkController.php:50','message'=>'Before generateToken call','data'=>['user_id'=>$user->id,'ip'=>$request->ip()],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion

            // Generate JWT token
            $token = $this->passwordResetService->generateToken($user, $request->ip());

            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'A','location'=>'PasswordResetLinkController.php:54','message'=>'After generateToken call','data'=>['token_length'=>strlen($token),'token_preview'=>substr($token,0,20)],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion

            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'C','location'=>'PasswordResetLinkController.php:57','message'=>'Before emailService->send call','data'=>['email'=>$user->email,'mailable_class'=>PasswordResetMail::class],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion

            // Send password reset email
            // In development, send synchronously; in production, use queue
            $shouldQueue = env('APP_ENV') === 'production';
            $this->emailService->send(
                $user->email,
                PasswordResetMail::class,
                [
                    $token,
                    $user->email,
                    $user->name,
                    $this->passwordResetService->getExpiryMinutes()
                ],
                $shouldQueue
            );

            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'C','location'=>'PasswordResetLinkController.php:70','message'=>'After emailService->send call - success','data'=>[],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion

            return back()->with('status', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
        } catch (\Exception $e) {
            // #region agent log
            file_put_contents(base_path('.cursor/debug.log'), json_encode(['sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'ALL','location'=>'PasswordResetLinkController.php:76','message'=>'Exception caught','data'=>['exception_class'=>get_class($e),'message'=>$e->getMessage(),'file'=>$e->getFile(),'line'=>$e->getLine(),'trace'=>substr($e->getTraceAsString(),0,500)],'timestamp'=>time()*1000])."\n", FILE_APPEND | LOCK_EX);
            // #endregion

            throw ValidationException::withMessages([
                'email' => ['حدث خطأ أثناء إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.'],
            ]);
        }
    }
}
