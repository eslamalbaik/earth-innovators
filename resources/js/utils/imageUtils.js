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

/**
 * Get publication cover image URL
 * Handles both absolute URLs (from Laravel accessor) and relative paths
 * @param {string|null|undefined} imagePath - The image path from the API
 * @param {string} fallback - Fallback image path (default: '/images/default-publication.jpg')
 * @returns {string} The complete image URL
 */
export const getPublicationImageUrl = (imagePath, fallback = '/images/default-publication.jpg') => {
    if (!imagePath) {
        return fallback;
    }

    // If it's already a full URL (absolute), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it's a data URL (base64), return as is
    if (imagePath.startsWith('data:')) {
        return imagePath;
    }

    // If it starts with /storage/ or /images/, it's already a proper path
    if (imagePath.startsWith('/storage/') || imagePath.startsWith('/images/')) {
        return imagePath;
    }

    // If it starts with storage/ without leading slash, add it
    if (imagePath.startsWith('storage/')) {
        return '/' + imagePath;
    }

    // Assume it's a relative path in storage - prepend /storage/
    return `/storage/${imagePath}`;
};

/**
 * Get publication file URL
 * Similar to getPublicationImageUrl but for PDF files
 * @param {string|null|undefined} filePath - The file path from the API
 * @returns {string|null} The complete file URL or null
 */
export const getPublicationFileUrl = (filePath) => {
    if (!filePath) {
        return null;
    }

    // If it's already a full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }

    // If it starts with /storage/, it's already a proper path
    if (filePath.startsWith('/storage/')) {
        return filePath;
    }

    // If it starts with storage/ without leading slash, add it
    if (filePath.startsWith('storage/')) {
        return '/' + filePath;
    }

    // Assume it's a relative path in storage
    return `/storage/${filePath}`;
};

