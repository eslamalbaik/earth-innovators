export const getStorageUrl = (path, fallback = null) => {
    if (!path || typeof path !== 'string') {
        return fallback;
    }

    const value = path.trim();
    if (!value) {
        return fallback;
    }

    if (value.startsWith('data:') || value.startsWith('blob:')) {
        return value;
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
        try {
            const url = new URL(value);
            if (url.pathname.startsWith('/storage/') || url.pathname.startsWith('/media/')) {
                const cleanPath = url.pathname
                    .replace(/^\/+/, '')
                    .replace(/^(storage|media)\//, '');
                return `/media/${cleanPath}${url.search}`;
            }
        } catch (error) {
            return value;
        }

        return value;
    }

    if (value.startsWith('/images/') || value.startsWith('images/')) {
        return value.startsWith('/') ? value : `/${value}`;
    }

    const [pathPart, queryPart] = value.split('?');
    const cleanPath = pathPart
        .replace(/^\/+/, '')
        .replace(/^(storage|media)\//, '');

    if (!cleanPath) {
        return fallback;
    }

    return `/media/${cleanPath}${queryPart ? `?${queryPart}` : ''}`;
};

export const getUserImageUrl = (user, teacher = null) => {
    if (user?.role === 'teacher' && teacher?.image) {
        return getStorageUrl(teacher.image);
    }

    if (user?.image) {
        return getStorageUrl(user.image);
    }

    if (user?.teacher?.image) {
        return getStorageUrl(user.teacher.image);
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
 * Default cover images per publication type, sourced from Unsplash.
 * Used when a publication has no uploaded cover_image.
 */
const PUBLICATION_TYPE_FALLBACK_IMAGES = {
    magazine: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
    booklet: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=80',
    report: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    article: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
};

export const getPublicationTypeFallbackImage = (type) => {
    return PUBLICATION_TYPE_FALLBACK_IMAGES[type] || PUBLICATION_TYPE_FALLBACK_IMAGES.magazine;
};

/**
 * Get publication cover image URL
 * Handles both absolute URLs (from Laravel accessor) and relative paths
 * @param {string|null|undefined} imagePath - The image path from the API
 * @param {string} fallback - Fallback image path (default: type-based Unsplash image, or magazine fallback)
 * @returns {string} The complete image URL
 */
export const getPublicationImageUrl = (imagePath, fallback = PUBLICATION_TYPE_FALLBACK_IMAGES.magazine) => {
    return getStorageUrl(imagePath, fallback);
};

/**
 * Get challenge image URL
 * Supports accessor URLs, storage paths, images directory assets and inline previews.
 * @param {string|null|undefined} imagePath
 * @param {string} fallback
 * @returns {string}
 */
export const getChallengeImageUrl = (imagePath, fallback = '/images/hero.png') => {
    return getStorageUrl(imagePath, fallback);
};

/**
 * Get publication file URL
 * Similar to getPublicationImageUrl but for PDF files
 * @param {string|null|undefined} filePath - The file path from the API
 * @returns {string|null} The complete file URL or null
 */
export const getPublicationFileUrl = (filePath) => {
    return getStorageUrl(filePath, null);
};

export const getProjectFileUrl = (filePath) => getStorageUrl(filePath, null);
export const getProjectImageUrl = (imagePath, fallback = null) => getStorageUrl(imagePath, fallback);
export const getBadgeImageUrl = (imagePath, fallback = null) => getStorageUrl(imagePath, fallback);
