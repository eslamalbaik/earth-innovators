<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فاتورة {{ $invoice_number }} — إرث المبتكرين</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            background: #f8fafc;
            color: #1e293b;
            direction: rtl;
        }

        .page {
            max-width: 800px;
            margin: 40px auto;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            overflow: hidden;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #A3C042, #6ea832);
            padding: 36px 40px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header .brand span { opacity: 0.8; font-size: 13px; display: block; font-weight: 400; margin-top: 2px; }
        .header .invoice-meta { text-align: left; }
        .header .invoice-meta .num { font-size: 20px; font-weight: 700; }
        .header .invoice-meta .date { opacity: 0.85; font-size: 13px; margin-top: 4px; }

        /* Status badge */
        .status-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.4);
            color: white;
            border-radius: 999px;
            padding: 4px 14px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
        }

        /* Body */
        .body { padding: 36px 40px; }

        .section-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            margin-bottom: 14px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 8px;
        }

        /* Bill To */
        .bill-to { margin-bottom: 32px; }
        .bill-to .name { font-size: 18px; font-weight: 700; color: #1e293b; }
        .bill-to .email { color: #64748b; font-size: 13px; margin-top: 3px; }

        /* Items table */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .items-table th {
            background: #f8fafc;
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            padding: 10px 14px;
            text-align: right;
            border-bottom: 2px solid #e2e8f0;
        }
        .items-table td {
            padding: 14px;
            font-size: 14px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
        }
        .items-table tr:last-child td { border-bottom: none; }
        .items-table .pkg-name { font-weight: 600; color: #1e293b; }
        .items-table .pkg-sub { font-size: 12px; color: #94a3b8; margin-top: 3px; }

        /* Total */
        .total-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
        }
        .total-section .label { font-size: 14px; color: #64748b; font-weight: 600; }
        .total-section .amount {
            font-size: 28px;
            font-weight: 800;
            color: #A3C042;
        }
        .total-section .currency { font-size: 14px; color: #94a3b8; margin-right: 4px; }

        /* Payment info */
        .payment-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 32px;
        }
        .info-card {
            background: #f8fafc;
            border-radius: 10px;
            padding: 14px 16px;
        }
        .info-card .info-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-card .info-value { font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 4px; word-break: break-all; }

        /* Footer */
        .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 20px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        }

        /* Print button */
        .print-btn {
            display: block;
            width: 180px;
            margin: 24px auto;
            background: linear-gradient(135deg, #A3C042, #6ea832);
            color: white;
            border: none;
            border-radius: 10px;
            padding: 12px 0;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            text-align: center;
        }

        @media print {
            body { background: white; }
            .page { box-shadow: none; margin: 0; border-radius: 0; }
            .print-btn { display: none; }
        }
    </style>
</head>
<body>

<div class="page">
    <!-- Header -->
    <div class="header">
        <div class="brand">
            إرث المبتكرين
            <span>Earth Innovators Platform</span>
        </div>
        <div class="invoice-meta">
            <div class="num">{{ $invoice_number }}</div>
            <div class="date">{{ $issue_date }}</div>
            <div class="status-badge">✓ مدفوعة</div>
        </div>
    </div>

    <!-- Body -->
    <div class="body">

        <!-- Bill To -->
        <div class="bill-to">
            <div class="section-title">فاتورة إلى</div>
            <div class="name">{{ $user_name }}</div>
            <div class="email">{{ $user_email }}</div>
        </div>

        <!-- Items -->
        <div class="section-title">تفاصيل الاشتراك</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th>الباقة</th>
                    <th style="text-align:center">النوع</th>
                    <th style="text-align:left">المبلغ</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="pkg-name">{{ $package_name }}</div>
                        <div class="pkg-sub">{{ $package_name_en }}</div>
                    </td>
                    <td style="text-align:center">
                        @if($is_trial)
                            <span style="background:#dbeafe;color:#1d4ed8;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600;">تجريبية</span>
                        @else
                            <span style="background:#dcfce7;color:#15803d;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600;">مدفوعة</span>
                        @endif
                    </td>
                    <td style="text-align:left;font-weight:700;color:#1e293b;">
                        {{ $amount }} {{ $currency }}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Total -->
        <div class="total-section">
            <div class="label">إجمالي المبلغ المدفوع</div>
            <div class="amount">
                <span class="currency">{{ $currency }}</span>{{ $amount }}
            </div>
        </div>

        <!-- Payment details -->
        <div class="section-title">تفاصيل الدفع</div>
        <div class="payment-info">
            <div class="info-card">
                <div class="info-label">طريقة الدفع</div>
                <div class="info-value">{{ $payment_method ?? '—' }}</div>
            </div>
            <div class="info-card">
                <div class="info-label">بوابة الدفع</div>
                <div class="info-value">{{ $payment_gateway ?? '—' }}</div>
            </div>
            <div class="info-card" style="grid-column: 1 / -1;">
                <div class="info-label">رقم المعاملة</div>
                <div class="info-value" style="font-family:monospace;font-size:12px;">{{ $transaction_id ?? '—' }}</div>
            </div>
        </div>

    </div>

    <!-- Footer -->
    <div class="footer">
        <p>شكراً لاشتراكك في منصة إرث المبتكرين — هذه الوثيقة تُعدّ إيصالاً رسمياً لعملية الدفع.</p>
        <p style="margin-top:6px;">للاستفسارات: support@earth-innovators.com</p>
    </div>
</div>

<button class="print-btn" onclick="window.print()">🖨️ طباعة / PDF</button>

</body>
</html>
