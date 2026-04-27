const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const XHTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

const wrapSvg = (content, width, height) => `
<svg xmlns="${SVG_NAMESPACE}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <foreignObject width="100%" height="100%">
    ${content}
  </foreignObject>
</svg>`;

const copyComputedStyles = (sourceNode, targetNode) => {
    if (!(sourceNode instanceof Element) || !(targetNode instanceof Element)) {
        return;
    }

    const computedStyle = window.getComputedStyle(sourceNode);
    const styleText = Array.from(computedStyle)
        .map((property) => `${property}:${computedStyle.getPropertyValue(property)};`)
        .join('');

    targetNode.setAttribute('style', styleText);

    // Preserve form field values and canvas content inside the exported clone.
    if (sourceNode instanceof HTMLInputElement || sourceNode instanceof HTMLTextAreaElement) {
        targetNode.setAttribute('value', sourceNode.value);
    }

    if (sourceNode instanceof HTMLCanvasElement && targetNode instanceof HTMLCanvasElement) {
        const context = targetNode.getContext('2d');
        if (context) {
            context.drawImage(sourceNode, 0, 0);
        }
    }

    const sourceChildren = Array.from(sourceNode.children);
    const targetChildren = Array.from(targetNode.children);

    sourceChildren.forEach((child, index) => {
        copyComputedStyles(child, targetChildren[index]);
    });
};

const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

const resolveAssetUrl = (value) => {
    if (!value || value === 'none') {
        return null;
    }

    try {
        return new URL(value, window.location.href).href;
    } catch {
        return null;
    }
};

const inlineImageElement = async (sourceNode, targetNode) => {
    const source = sourceNode.currentSrc || sourceNode.src;
    const resolvedSource = resolveAssetUrl(source);

    if (!resolvedSource) {
        return;
    }

    try {
        const response = await fetch(resolvedSource, { mode: 'cors' });
        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        targetNode.setAttribute('src', dataUrl);
        targetNode.setAttribute('crossorigin', 'anonymous');
    } catch {
        targetNode.setAttribute('src', resolvedSource);
    }
};

const inlineBackgroundImages = async (sourceNode, targetNode) => {
    if (!(sourceNode instanceof Element) || !(targetNode instanceof Element)) {
        return;
    }

    const computedStyle = window.getComputedStyle(sourceNode);
    const backgroundImage = computedStyle.getPropertyValue('background-image');

    if (backgroundImage && backgroundImage !== 'none') {
        const matches = [...backgroundImage.matchAll(/url\((['"]?)(.*?)\1\)/g)];
        let nextBackgroundImage = backgroundImage;

        for (const match of matches) {
            const originalUrl = match[2];
            const resolvedUrl = resolveAssetUrl(originalUrl);
            if (!resolvedUrl) {
                continue;
            }

            try {
                const response = await fetch(resolvedUrl, { mode: 'cors' });
                const blob = await response.blob();
                const dataUrl = await blobToDataUrl(blob);
                nextBackgroundImage = nextBackgroundImage.replace(originalUrl, dataUrl);
            } catch {
                nextBackgroundImage = nextBackgroundImage.replace(originalUrl, resolvedUrl);
            }
        }

        targetNode.style.backgroundImage = nextBackgroundImage;
    }

    const sourceChildren = Array.from(sourceNode.children);
    const targetChildren = Array.from(targetNode.children);

    await Promise.all(
        sourceChildren.map((child, index) => inlineBackgroundImages(child, targetChildren[index]))
    );
};

const inlineAssets = async (sourceNode, targetNode) => {
    if (sourceNode instanceof HTMLImageElement && targetNode instanceof HTMLImageElement) {
        await inlineImageElement(sourceNode, targetNode);
    }

    await inlineBackgroundImages(sourceNode, targetNode);

    const sourceChildren = Array.from(sourceNode.children);
    const targetChildren = Array.from(targetNode.children);

    await Promise.all(sourceChildren.map((child, index) => inlineAssets(child, targetChildren[index])));
};

const loadImage = (src) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });

const waitForImageElementLoad = (imageElement) =>
    new Promise((resolve, reject) => {
        if (!imageElement) {
            reject(new Error('Image element is required.'));
            return;
        }

        if (imageElement.complete && imageElement.naturalWidth > 0) {
            resolve();
            return;
        }

        const handleLoad = () => {
            cleanup();
            resolve();
        };

        const handleError = () => {
            cleanup();
            reject(new Error('Printable image could not be loaded.'));
        };

        const cleanup = () => {
            imageElement.removeEventListener('load', handleLoad);
            imageElement.removeEventListener('error', handleError);
        };

        imageElement.addEventListener('load', handleLoad, { once: true });
        imageElement.addEventListener('error', handleError, { once: true });
    });

const canvasToBlob = (canvas) =>
    new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
                return;
            }

            reject(new Error('Canvas blob generation failed.'));
        }, 'image/png');
    });

export const downloadElementAsImage = async (element, filename = 'certificate.png') => {
    if (!element) {
        throw new Error('Element is required.');
    }

    const dataUrl = await renderElementToPngDataUrl(element);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const renderElementToPngDataUrl = async (element) => {
    const canvas = await renderElementToCanvas(element);
    return canvas.toDataURL('image/png');
};

export const renderElementToPngBlob = async (element) => {
    const canvas = await renderElementToCanvas(element);
    return canvasToBlob(canvas);
};

const renderElementToCanvas = async (element) => {
    if (!element) {
        throw new Error('Element is required.');
    }

    const rect = element.getBoundingClientRect();
    const width = Math.max(Math.ceil(rect.width), element.scrollWidth, 1);
    const height = Math.max(Math.ceil(rect.height), element.scrollHeight, 1);
    const clone = element.cloneNode(true);

    copyComputedStyles(element, clone);
    await inlineAssets(element, clone);

    clone.setAttribute('xmlns', XHTML_NAMESPACE);
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.margin = '0';
    clone.style.boxSizing = 'border-box';

    const wrapper = document.createElement('div');
    wrapper.setAttribute('xmlns', XHTML_NAMESPACE);
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;
    wrapper.style.overflow = 'hidden';
    wrapper.appendChild(clone);

    const markup = new XMLSerializer().serializeToString(wrapper);
    const svg = wrapSvg(markup, width, height);
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const image = await loadImage(url);

    const scale = Math.max(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Canvas is unavailable.');
    }

    context.scale(scale, scale);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas;
};

export const printElementAsImage = async (element, title = 'Certificate', existingPrintWindow = null) => {
    if (existingPrintWindow && !existingPrintWindow.closed) {
        existingPrintWindow.close();
    }

    const blob = await renderElementToPngBlob(element);
    const objectUrl = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const printWindow = iframe.contentWindow;
    const printDocument = printWindow?.document;

    if (!printWindow || !printDocument) {
        iframe.remove();
        URL.revokeObjectURL(objectUrl);
        throw new Error('Print frame could not be created.');
    }

    printDocument.open();
    printDocument.write(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>${title}</title>
                <style>
                    @page { size: A4 landscape; margin: 0; }
                    html, body {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        background: #ffffff;
                        overflow: hidden;
                    }
                    body {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    img {
                        display: block;
                        width: auto;
                        max-width: 100%;
                        height: auto;
                        max-height: 100vh;
                        object-fit: contain;
                    }
                </style>
            </head>
            <body>
                <img id="print-image" alt="${title}" />
            </body>
        </html>
    `);
    printDocument.close();

    const image = printDocument.getElementById('print-image');
    if (!(image instanceof printWindow.HTMLImageElement)) {
        iframe.remove();
        URL.revokeObjectURL(objectUrl);
        throw new Error('Printable image element could not be created.');
    }

    image.src = objectUrl;
    await waitForImageElementLoad(image);

    await new Promise((resolve, reject) => {
        let finished = false;

        const cleanup = () => {
            if (finished) {
                return;
            }

            finished = true;
            printWindow.removeEventListener('afterprint', handleAfterPrint);
            iframe.remove();
            URL.revokeObjectURL(objectUrl);
            resolve();
        };

        const handleAfterPrint = () => {
            cleanup();
        };

        printWindow.addEventListener('afterprint', handleAfterPrint, { once: true });

        setTimeout(() => {
            try {
                printWindow.focus();
                printWindow.print();
            } catch (error) {
                cleanup();
                reject(error);
            }
        }, 50);

        setTimeout(cleanup, 10000);
    });
};

export const shareElementAsImage = async (
    element,
    {
        filename = 'certificate.png',
        title = 'Certificate',
        text = '',
    } = {}
) => {
    if (!navigator.share) {
        throw new Error('Web Share API is unavailable.');
    }

    const blob = await renderElementToPngBlob(element);
    const safeFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
    const file = new File([blob], safeFilename, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            title,
            text,
            files: [file],
        });
        return;
    }

    throw new Error('File sharing is unavailable.');
};
