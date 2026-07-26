<?php

namespace App\Services\AIEngine;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

/**
 * DeepSeek API Client
 *
 * Handles all communication with the DeepSeek API.
 * Base URL: https://api.deepseek.com/v1
 * Model: deepseek-chat
 */
class DeepSeekClient
{
    private string $apiKey;
    private string $baseUrl = 'https://api.deepseek.com';
    private string $model = 'deepseek-chat';

    public function __construct()
    {
        $this->apiKey = config('services.deepseek.api_key');
    }

    /**
     * Send a chat completion request
     */
    public function chat(array $messages, float $temperature = 0.3, int $maxTokens = 2000): ?string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type'  => 'application/json',
            ])
            ->timeout(60)
            ->retry(2, 1000)
            ->post("{$this->baseUrl}/chat/completions", [
                'model'       => $this->model,
                'messages'    => $messages,
                'temperature' => $temperature,
                'max_tokens'  => $maxTokens,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['choices'][0]['message']['content'] ?? null;

                Log::info('DeepSeek API call successful', [
                    'usage' => $data['usage'] ?? [],
                    'model' => $data['model'] ?? $this->model,
                ]);

                return $content;
            }

            Log::error('DeepSeek API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return null;

        } catch (RequestException $e) {
            Log::error('DeepSeek API request failed', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Send a chat request expecting JSON structured output
     */
    public function chatWithJson(array $messages, float $temperature = 0.2, int $maxTokens = 3000): ?array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type'  => 'application/json',
            ])
            ->timeout(90)
            ->retry(2, 1000)
            ->post("{$this->baseUrl}/chat/completions", [
                'model'           => $this->model,
                'messages'        => $messages,
                'temperature'     => $temperature,
                'max_tokens'      => $maxTokens,
                'response_format' => ['type' => 'json_object'],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['choices'][0]['message']['content'] ?? null;

                Log::info('DeepSeek JSON API call successful', [
                    'usage' => $data['usage'] ?? [],
                ]);

                if ($content) {
                    return json_decode($content, true);
                }
            }

            Log::error('DeepSeek JSON API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return null;

        } catch (RequestException $e) {
            Log::error('DeepSeek JSON API request failed', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Build a system message for a specific analysis task
     */
    public static function systemMessage(string $role): array
    {
        return [
            'role'    => 'system',
            'content' => $role,
        ];
    }

    /**
     * Build a user message
     */
    public static function userMessage(string $content): array
    {
        return [
            'role'    => 'user',
            'content' => $content,
        ];
    }
}
