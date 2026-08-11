<?php

namespace App\Services\AIEngine;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

/**
 * Gemini API Client
 *
 * Handles all communication with the Google Gemini (Generative Language) API.
 * Base URL: https://generativelanguage.googleapis.com/v1beta
 */
class GeminiClient
{
    private string $apiKey;
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->baseUrl = config('services.gemini.base_url');
        $this->model = config('services.gemini.model');
    }

    /**
     * Send a chat completion request
     */
    public function chat(array $messages, float $temperature = 0.3, int $maxTokens = 2000): ?string
    {
        return $this->request($messages, $temperature, $maxTokens, false);
    }

    /**
     * Send a chat request expecting JSON structured output
     */
    public function chatWithJson(array $messages, float $temperature = 0.2, int $maxTokens = 3000): ?array
    {
        $content = $this->request($messages, $temperature, $maxTokens, true);

        if ($content === null) {
            return null;
        }

        $decoded = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // Gemini sometimes emits raw control characters (literal newlines, tabs,
            // etc.) inside JSON string values instead of escaping them; escape any
            // control character within string literals only, leaving the surrounding
            // structure intact.
            $sanitized = preg_replace_callback('/"(?:[^"\\\\]|\\\\.)*"/s', function (array $m) {
                return preg_replace_callback('/[\x00-\x1F]/', function (array $c) {
                    return match ($c[0]) {
                        "\n" => '\\n',
                        "\r" => '\\r',
                        "\t" => '\\t',
                        default => sprintf('\\u%04x', ord($c[0])),
                    };
                }, $m[0]);
            }, $content);

            $decoded = json_decode($sanitized, true);
        }

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Gemini API returned invalid JSON', [
                'json_error'     => json_last_error_msg(),
                'content_base64' => base64_encode($content),
                'content'    => mb_substr($content, 0, 2000),
            ]);
            return null;
        }

        return $decoded;
    }

    /**
     * Perform the actual HTTP call to Gemini's generateContent endpoint
     */
    private function request(array $messages, float $temperature, int $maxTokens, bool $asJson): ?string
    {
        [$systemInstruction, $contents] = $this->buildPayload($messages);

        $body = [
            'contents' => $contents,
            'generationConfig' => [
                'temperature'     => $temperature,
                'maxOutputTokens' => $maxTokens,
            ],
        ];

        if ($systemInstruction !== null) {
            $body['systemInstruction'] = $systemInstruction;
        }

        if ($asJson) {
            $body['generationConfig']['responseMimeType'] = 'application/json';
        }

        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $this->apiKey,
                'Content-Type'   => 'application/json',
            ])
            ->timeout($asJson ? 90 : 60)
            ->retry(4, fn (int $attempt) => min(1000 * (2 ** ($attempt - 1)), 8000))
            ->post("{$this->baseUrl}/models/{$this->model}:generateContent", $body);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

                Log::info('Gemini API call successful', [
                    'usage' => $data['usageMetadata'] ?? [],
                    'model' => $this->model,
                ]);

                return $content;
            }

            Log::error('Gemini API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return null;

        } catch (RequestException $e) {
            Log::error('Gemini API request failed', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Convert the {role, content} message list (system/user) into Gemini's
     * systemInstruction + contents shape.
     */
    private function buildPayload(array $messages): array
    {
        $systemParts = [];
        $contents = [];

        foreach ($messages as $message) {
            $role = $message['role'] ?? 'user';
            $text = $message['content'] ?? '';

            if ($role === 'system') {
                $systemParts[] = ['text' => $text];
                continue;
            }

            $contents[] = [
                'role'  => $role === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $text]],
            ];
        }

        $systemInstruction = $systemParts ? ['parts' => $systemParts] : null;

        return [$systemInstruction, $contents];
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
