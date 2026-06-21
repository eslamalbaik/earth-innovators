<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Expire past-due subscriptions/trials and send expiry reminders once a day.
Schedule::command('subscriptions:process')
    ->dailyAt('02:00')
    ->withoutOverlapping();
