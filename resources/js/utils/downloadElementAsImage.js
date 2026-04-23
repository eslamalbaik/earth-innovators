const wrapSvg = (content, width, height) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <foreignObject width="100%" height="100%">
    ${content}
  </foreignObject>
</svg>`;

export const downloadElementAsImage = async (element, filename = 'certificate.png') => {
    if (!element) {
        throw new Error('Element is required.');
    }

    const rect = element.getBoundingClientRect();
    const width = Math.max(Math.ceil(rect.width), element.scrollWidth, 1);
    const height = Math.max(Math.ceil(rect.height), element.scrollHeight, 1);
    const clone = element.cloneNode(true);

    clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.margin = '0';

    const markup = new XMLSerializer().serializeToString(clone);
    const svg = wrapSvg(markup, width, height);
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const image = new Image();

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
    });

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

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
};
