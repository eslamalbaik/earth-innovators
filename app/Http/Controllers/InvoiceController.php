<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    /**
     * Download a PDF payment invoice using TCPDF.
     *
     * Note: We intentionally keep this template in ASCII/English to avoid
     * encoding regressions when locale files or editor encoding are misconfigured.
     */
    public function download(Payment $payment)
    {
        $user = Auth::user();

        if (!$user || $payment->student_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        if ($payment->status !== 'completed') {
            return back()->with('error', [
                'key' => 'toastMessages.invoiceNotAvailable',
            ]);
        }

        $payment->load('package', 'userPackage');

        $data = [
            'invoice_number'  => 'INV-' . str_pad((string) $payment->id, 6, '0', STR_PAD_LEFT),
            'issue_date'      => $payment->paid_at?->format('Y-m-d') ?? $payment->created_at->format('Y-m-d'),
            'user_name'       => (string) $user->name,
            'user_email'      => (string) $user->email,
            'package_name'    => (string) ($payment->package?->name ?? 'Package'),
            'amount'          => number_format((float) $payment->amount, 2),
            'currency'        => strtoupper((string) ($payment->currency ?? 'AED')),
            'payment_method'  => (string) ($payment->payment_method ?? ''),
            'payment_gateway' => (string) ($payment->payment_gateway ?? ''),
            'transaction_id'  => (string) ($payment->transaction_id ?? $payment->payment_reference ?? ''),
            'is_trial'        => (bool) ($payment->package?->is_trial ?? false),
        ];

        if (request()->has('html')) {
            return response()->view('invoices.payment', $data)
                ->header('Content-Type', 'text/html; charset=utf-8');
        }

        require_once base_path('vendor/tecnickcom/tcpdf/tcpdf.php');

        $pdf = new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $pdf->SetCreator('Earth Innovators');
        $pdf->SetAuthor('Earth Innovators Platform');
        $pdf->SetTitle('Invoice ' . $data['invoice_number']);
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetMargins(15, 15, 15);
        $pdf->SetAutoPageBreak(true, 15);
        $pdf->setRTL(false);
        $pdf->SetFont('dejavusans', '', 12);
        $pdf->AddPage();

        $typeLabel = $data['is_trial'] ? 'Trial' : 'Paid';

        $logoPath = public_path('images/logo-modified.png');
        $logoHtml = '';
        if (file_exists($logoPath)) {
            $logoHtml = '<img src="' . $logoPath . '" style="width: 150px; height: auto;" />';
        }

        $html = <<<HTML
<div style="text-align:center; margin-bottom: 18px;">
  {$logoHtml}
  <h1 style="color:#6ea832; margin: 6px 0;">Earth Innovators</h1>
  <p style="color:#666; font-size: 12px; margin: 0;">Earth Innovators Platform</p>
</div>
<hr>
<p><strong>Invoice number:</strong> {$data['invoice_number']}</p>
<p><strong>Issue date:</strong> {$data['issue_date']}</p>
<p><strong>Status:</strong> Completed</p>
<br>
<h3 style="color:#333;">Bill To</h3>
<p>{$data['user_name']}<br>{$data['user_email']}</p>
<br>
<h3 style="color:#333;">Subscription details</h3>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
  <tr style="background-color:#f8fafc; font-weight:bold; text-align:center;">
    <th width="50%">Package</th>
    <th width="20%">Type</th>
    <th width="30%">Amount</th>
  </tr>
  <tr style="text-align:center;">
    <td>{$data['package_name']}</td>
    <td>{$typeLabel}</td>
    <td>{$data['amount']} {$data['currency']}</td>
  </tr>
</table>
<br>
<h3 style="color:#6ea832;">Total paid: {$data['amount']} {$data['currency']}</h3>
<br>
<h3 style="color:#333;">Payment</h3>
<p><strong>Method:</strong> {$data['payment_method']}</p>
<p><strong>Gateway:</strong> {$data['payment_gateway']}</p>
<p><strong>Transaction ID:</strong> {$data['transaction_id']}</p>
<br><br>
<p style="text-align:center; color:#666; font-size: 10px;">
  Thank you for your purchase. This document serves as a payment receipt.<br>
  Support: support@earth-innovators.com
</p>
HTML;

        $pdf->writeHTML($html, true, false, true, false, '');
        $pdf->Output($data['invoice_number'] . '.pdf', 'D');
        exit;
    }
}

