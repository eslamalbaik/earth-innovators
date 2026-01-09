<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomizePackageRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class CustomizePackageRequestController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'school_name' => 'nullable|string|max:255',
                'responsible_name' => 'required|string|max:255',
                'mobile_number' => 'required|string|max:20',
                'expected_students' => 'nullable|string|max:50',
                'additional_notes' => 'nullable|string|max:2000',
            ]);

            $packageRequest = CustomizePackageRequest::create($validated);

            // Send email notification to admin (optional)
            // You can uncomment this if you have admin email configured
            /*
            Mail::send('emails.customize-package-request', [
                'request' => $packageRequest
            ], function ($message) {
                $message->to(config('mail.admin_email'))
                    ->subject('طلب جديد لتخصيص باقة');
            });
            */

            Log::info('New customize package request created', [
                'id' => $packageRequest->id,
                'responsible_name' => $packageRequest->responsible_name,
                'mobile_number' => $packageRequest->mobile_number,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'يرجى التحقق من البيانات المدخلة.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating customize package request', [
                'error' => $e->getMessage(),
                'data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.',
            ], 500);
        }
    }
}
