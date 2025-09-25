import { sanitize } from "../../../utils/sanitize";



function sanitizeAndHighlight(html: string, searchTerm: string): string {
  if (!searchTerm.trim()) {
    // Just sanitize if no search term
    return sanitize(html);
  }

  // Sanitize first
  const sanitizedHTML = sanitize(html);

  // Parse sanitized HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedHTML, 'text/html');

  const walkAndHighlight = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
      if (regex.test(text)) {
        const frag = document.createDocumentFragment();

        let lastIndex = 0;
        text.replace(regex, (match, offset) => {
          // Append text before match
          const before = text.slice(lastIndex, offset);
          if (before) {
            frag.appendChild(document.createTextNode(before));
          }

          // Create highlighted span
          const mark = document.createElement('mark');
          mark.textContent = match;
          frag.appendChild(mark);

          lastIndex = offset + match.length;
          return match;
        });

        // Append remaining text
        const after = text.slice(lastIndex);
        if (after) {
          frag.appendChild(document.createTextNode(after));
        }

        // Replace original text node
        if (node.parentNode) {
          node.parentNode.replaceChild(frag, node);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(walkAndHighlight);
    }
  };

  walkAndHighlight(doc.body);

  return doc.body.innerHTML;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default sanitizeAndHighlight;

