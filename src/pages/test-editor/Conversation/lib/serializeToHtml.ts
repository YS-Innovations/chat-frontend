import type { Descendant } from 'slate';

export function serializeToHtml(nodes: Descendant[]): string {
  return nodes.map(n => serializeNode(n)).join('');
}

function serializeNode(node: any): string {
  // If it's a text node, apply marks
  if (node.text !== undefined) {
    let text = escapeHtml(node.text);

    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.code) text = `<code>${text}</code>`;

    return text;
  }

  // Recursively serialize children
  const children = (node.children || []).map(serializeNode).join('');

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`;
    case 'heading-one':
      return `<h1>${children}</h1>`;
    case 'heading-two':
      return `<h2>${children}</h2>`;
    case 'heading-three':
      return `<h3>${children}</h3>`;
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    case 'bulleted-list':
      return `<ul>${children}</ul>`;
    case 'list-item':
      return `<li>${children}</li>`;
    case 'code-block':
      return `<pre><code>${children}</code></pre>`;
    case 'link':
      return `<a href="${escapeAttr(node.url)}" target="_blank" rel="noopener noreferrer">${children}</a>`;
    case 'expand':
      return `<div class="expand-container"><div class="expand-title">${escapeHtml(
        node.title || 'Details'
      )}</div><div class="expand-content">${children}</div></div>`;
    default:
      return `<p>${children}</p>`; // fallback
  }
}

// Escape text content to prevent HTML injection
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Escape attribute values (like URLs)
function escapeAttr(str: string): string {
  return escapeHtml(str).replace(/"/g, '&quot;');
}
