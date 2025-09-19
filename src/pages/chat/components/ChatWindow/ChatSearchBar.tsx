// src/components/ChatWindow/ChatSearchBar.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface ChatSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  currentIndex: number;
  totalMatches: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onClear,
  currentIndex,
  totalMatches,
  onNext,
  onPrevious,
  onClose
}) => {
  return (
    <div className="px-4 py-2 border-b bg-gray-50">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search in conversation..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <X
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
            onClick={onClear}
          />
        )}
      </div>

      {searchQuery && totalMatches > 0 && (
        <div className="flex items-center gap-2 p-2 bg-white border-b text-sm">
          <span className="text-gray-600">
            {currentIndex + 1} of {totalMatches} matches
          </span>
          <button
            onClick={onPrevious}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={currentIndex === 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={onNext}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={currentIndex === totalMatches - 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatSearchBar;
