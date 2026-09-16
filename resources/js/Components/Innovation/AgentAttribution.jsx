import { Link } from '@inertiajs/react';
import { useTranslation } from '@/i18n';
import { findAiAgent } from '@/constants/aiAgents';

/**
 * Shows which AI agent is responsible for the content next to it (name +
 * job title), linking to its full profile in the AI Agent Directory.
 * Renders nothing if `agentKey` doesn't match a registered agent, so it is
 * always safe to add without risking a broken UI.
 */
export default function AgentAttribution({ agentKey, className = '' }) {
    const { t } = useTranslation();
    const agent = findAiAgent(agentKey);

    if (!agent) {
        return null;
    }

    return (
        <Link
            href={`/ai-agents#agent-${agent.key}`}
            title={t(`aiAgents.agents.${agent.key}.description`)}
            className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 ${className}`}
        >
            <span aria-hidden="true">{agent.icon}</span>
            <span>{t(`aiAgents.agents.${agent.key}.name`)}</span>
            <span className="opacity-60" aria-hidden="true">·</span>
            <span className="font-medium opacity-80">{t(`aiAgents.agents.${agent.key}.title`)}</span>
        </Link>
    );
}
