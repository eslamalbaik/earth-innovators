/**
 * Single source of truth for every AI "agent" persona operating behind the
 * platform's features (AI Agent Directory + per-touchpoint attribution).
 *
 * To add a new agent: append one entry here, then add its
 * `aiAgents.agents.<key>.{name,title,description}` strings to BOTH
 * resources/js/i18n/ar.js and en.js. No other file needs to change —
 * the directory page and <AgentAttribution> both render from this list.
 *
 * `key` must match the corresponding backend service/index concept so the
 * mapping stays obvious (e.g. the 8 scoring keys mirror
 * App\Services\ScoringEngine\*Calculator and InnovationIndex::INDEX_NAMES).
 */
export const AI_AGENTS = [
    // Scoring engine — one agent per innovation index calculator
    { key: 'skills', icon: '🎯', category: 'scoring' },
    { key: 'innovation', icon: '💡', category: 'scoring' },
    { key: 'intelligence', icon: '🧠', category: 'scoring' },
    { key: 'creativity', icon: '🎨', category: 'scoring' },
    { key: 'projects', icon: '🏗️', category: 'scoring' },
    { key: 'leadership', icon: '👑', category: 'scoring' },
    { key: 'ip', icon: '📜', category: 'scoring' },
    { key: 'future_readiness', icon: '🚀', category: 'scoring' },

    // Cross-cutting AI engine features
    { key: 'recommendations', icon: '🌱', category: 'guidance' },
    { key: 'content_generation', icon: '✍️', category: 'generation' },
    { key: 'achievement_validation', icon: '✅', category: 'validation' },
    { key: 'rubric_evaluation', icon: '📐', category: 'validation' },
    { key: 'smart_search', icon: '🔎', category: 'search' },
    { key: 'reporting', icon: '📋', category: 'reporting' },
    { key: 'platform_insights', icon: '🏛️', category: 'conversational' },
    { key: 'school_insights', icon: '🏫', category: 'conversational' },
    { key: 'student_success', icon: '🌟', category: 'conversational' },
    { key: 'fairness_bias', icon: '⚖️', category: 'governance' },
];

export const AI_AGENT_CATEGORIES = ['scoring', 'guidance', 'generation', 'validation', 'search', 'reporting', 'conversational', 'governance'];

export function findAiAgent(key) {
    return AI_AGENTS.find((a) => a.key === key) || null;
}
