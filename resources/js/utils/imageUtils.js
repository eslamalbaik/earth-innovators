export const getUserImageUrl = (user, teacher = null) => {
    if (user?.role === 'teacher' && teacher?.image) {
        if (teacher.image.startsWith('http://') || teacher.image.startsWith('https://')) {
            return teacher.image;
        }
        if (teacher.image.startsWith('/storage/')) {
            return teacher.image;
        }
        return `/storage/${teacher.image}`;
    }

    if (user?.image) {
        if (user.image.startsWith('http://') || user.image.startsWith('https://')) {
            return user.image;
        }
        if (user.image.startsWith('/storage/')) {
            return user.image;
        }
        return `/storage/${user.image}`;
    }

    if (user?.teacher?.image) {
        const teacherImage = user.teacher.image;
        if (teacherImage.startsWith('http://') || teacherImage.startsWith('https://')) {
            return teacherImage;
        }
        if (teacherImage.startsWith('/storage/')) {
            return teacherImage;
        }
        return `/storage/${teacherImage}`;
    }

    return null;
};

export const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || 'U';
};

export const getColorFromName = (name) => {
    const colors = [
        '#fbbf24, #f59e0b',
        '#fcd34d, #fbbf24',
        '#fde047, #facc15',
        '#fbbf24, #d97706',
        '#fcd34d, #f59e0b',
        '#fde047, #eab308',
        '#fef3c7, #fcd34d',
        '#fef08a, #fde047',
        '#fbbf24, #f97316',
        '#fcd34d, #fb923c',
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

