const getFilenameFromHeader = (contentDisposition) => {
    if (!contentDisposition) {
        return null;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1]);
    }

    const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    if (asciiMatch?.[1]) {
        return asciiMatch[1];
    }

    return null;
};

export const downloadFile = async (url, fallbackFilename = 'download.pdf') => {
    const response = await fetch(url, {
        credentials: 'same-origin',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const filename = getFilenameFromHeader(response.headers.get('content-disposition')) || fallbackFilename;
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
    }, 1000);
};
