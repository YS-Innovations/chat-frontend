// src/utils/sanitize.ts
import sanitizeHtml from 'sanitize-html';

export function sanitize(input: string): string {
    return sanitizeHtml(input, {
        allowedTags: [
            'b', 'i', 'em', 'strong', 'u', 'a', 'p', 'h1', 'h2', 'h3',
            'br', 'ul', 'ol', 'li', 'code', 'pre', 'div', 'span',
            'img', 'figure', 'figcaption'
        ],
        allowedAttributes: {
            a: ['href', 'target', 'rel'],
            img: ['src', 'alt', 'width', 'height', 'class'],
            div: ['class'],
            span: ['class'],
            code: ['class'],
            figure: ['class'],
            figcaption: ['class'],
        },
        allowedClasses: {
            code: ['hljs*', 'language-*'],
            div: ['expand-container'],
            span: ['hljs*'],
            img: ['thumbnail', 'rounded', 'responsive', 'expand-img'],
            figure: ['expand-container'],
        },
        // Default safe URL schemes
        allowedSchemes: ['http', 'https', 'mailto'],
        // Allow data: URIs for images only (helpful when users paste images as base64)
        allowedSchemesByTag: {
            img: ['http', 'https', 'data'],
        },
        transformTags: {
            // Ensure links open in a new tab and are safe
            a: sanitizeHtml.simpleTransform('a', {
                rel: 'noopener noreferrer',
                target: '_blank',
            }),
            // Optionally normalise img tags (strip width/height values that look suspicious)
            img: (_tagName: string, attribs: Record<string, string>) => {
                const src = attribs.src || '';
                const alt = (attribs.alt || '').toString().slice(0, 200);

                return {
                    tagName: 'img',
                    attribs: {
                        src,
                        alt,
                        ...(attribs.width ? { width: attribs.width } : {}),
                        ...(attribs.height ? { height: attribs.height } : {}),
                        ...(attribs.class ? { class: attribs.class } : {}),
                    },
                };
            },
        },
        // Do not allow any unknown protocols or untrusted attributes
        allowProtocolRelative: false,
    });
}
