export const getStageLabels = (t) => {
    const labels = {
        primary: t('bookingModal.stages.primary'),
        middle: t('bookingModal.stages.middle'),
        high: t('bookingModal.stages.high'),
        university: t('bookingModal.stages.university'),
    };

    const aliases = {
        primary: 'primary',
        elementary: 'primary',
        'primary school': 'primary',
        '\u0627\u0644\u0627\u0628\u062a\u062f\u0627\u0626\u064a\u0629': 'primary',
        middle: 'middle',
        'middle school': 'middle',
        '\u0627\u0644\u0645\u062a\u0648\u0633\u0637\u0629': 'middle',
        high: 'high',
        secondary: 'high',
        'high school': 'high',
        '\u0627\u0644\u062b\u0627\u0646\u0648\u064a\u0629': 'high',
        university: 'university',
        college: 'university',
        '\u0627\u0644\u062c\u0627\u0645\u0639\u064a\u0629': 'university',
    };

    Object.entries(labels).forEach(([key, value]) => {
        if (typeof value !== 'string') {
            return;
        }

        aliases[value] = key;
        aliases[value.toLowerCase()] = key;
    });

    return {
        toKey: aliases,
        toLabel: labels,
    };
};

export const formatLocationWithStages = (location, stageLabels) => {
    if (!location) return '';

    const generalStages = ['primary', 'middle', 'high', 'university'];

    if (location.includes(' - ')) {
        const [city, stagesPart] = location.split(' - ');
        if (!stagesPart) return city;

        const stages = stagesPart.split(' / ').map((stage) => stage.trim());
        const generalStagesOnly = stages
            .map((stage) => {
                const trimmed = stage?.trim?.();
                if (!trimmed) return null;

                return (
                    stageLabels?.toKey?.[trimmed]
                    || stageLabels?.toKey?.[trimmed.toLowerCase?.()]
                    || trimmed
                );
            })
            .filter((stage) => generalStages.includes(stage));

        if (generalStagesOnly.length > 0) {
            const display = generalStagesOnly
                .map((key) => stageLabels?.toLabel?.[key] || key)
                .join(' / ');

            return `${city} - ${display}`;
        }

        return city;
    }

    return location;
};
