<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use App\Services\EmailService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Mail\OtpMail;

class OtpAuthController extends Controller
{
    public function __construct(
        private OtpService $otpService,
        private EmailService $emailService
    ) {}

    /**
     * Request OTP for signup
     */
    public function requestSignupOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $otp = $this->otpService->generate(
                $request->email,
                'signup',
                $request->ip(),
                ['name' => $request->name]
            );

            // Send OTP email
            $this->emailService->send(
                $request->email,
                OtpMail::class,
                [
                    $otp->plain_code,
                    'signup',
                    $this->otpService->getExpiryMinutes()
                ],
                true // queue the email
            );

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
                'token' => $otp->token,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verify OTP and complete signup
     */
    public function verifySignupOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:student,teacher,school',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Verify OTP
            if (!$this->otpService->verify($request->email, $request->code, 'signup', $request->token)) {
                return response()->json([
                    'success' => false,
                    'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية'
                ], 400);
            }

            // Get OTP payload (contains name)
            $otp = $this->otpService->getByToken($request->token);
            $name = $otp->payload['name'] ?? $request->name;

            // Create user
            $user = User::create([
                'name' => $name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'email_verified_at' => now(),
            ]);

            // Log in user
            Auth::login($user);

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء الحساب بنجاح',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Request OTP for login
     */
    public function requestLoginOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $otp = $this->otpService->generate(
                $request->email,
                'login',
                $request->ip()
            );

            // Send OTP email
            $this->emailService->send(
                $request->email,
                OtpMail::class,
                [
                    $otp->plain_code,
                    'login',
                    $this->otpService->getExpiryMinutes()
                ],
                true // queue the email
            );

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
                'token' => $otp->token,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verify OTP and login
     */
    public function verifyLoginOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Verify OTP
            if (!$this->otpService->verify($request->email, $request->code, 'login', $request->token)) {
                return response()->json([
                    'success' => false,
                    'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية'
                ], 400);
            }

            // Get user
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'المستخدم غير موجود'
                ], 404);
            }

            // Log in user
            Auth::login($user);

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الدخول بنجاح',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
