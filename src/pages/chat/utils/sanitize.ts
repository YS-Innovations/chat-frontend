import sanitizeHtml from 'sanitize-html';

export function sanitize(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'u', 'a', 'p', 'h1', 'h2', 
      'br', 'ul', 'ol', 'li', 'code', 'pre', 'div', 'span'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      div: ['class'],
      span: ['class'],
      code: ['class'],
    },
    allowedClasses: {
      code: ['hljs*', 'language-*'],
      div: ['expand-container'],
      span: ['hljs*']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { 
        rel: 'noopener noreferrer', 
        target: '_blank' 
      }),
    },
  });
}
