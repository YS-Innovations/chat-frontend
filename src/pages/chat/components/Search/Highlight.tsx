// src/pages/chat/components/Search/Highlight.tsx
import React from 'react';

interface HighlightProps {
  text: string;
  searchTerm: string;
}

export const Highlight: React.FC<HighlightProps> = ({ text, searchTerm }) => {
  if (!searchTerm || !text) {
    return <>{text}</>;
  }

  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const parts = [];
  let lastIndex = 0;
  let index = lowerText.indexOf(lowerSearchTerm);

  while (index !== -1) {
    // Add the non-matching part
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index));
    }

    // Add the matching part
    parts.push(
      <span key={index} className="bg-orange-200 font-semibold">
        {text.substring(index, index + searchTerm.length)}
      </span>
    );

    lastIndex = index + searchTerm.length;
    index = lowerText.indexOf(lowerSearchTerm, lastIndex);
  }

  // Add the remaining part
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};