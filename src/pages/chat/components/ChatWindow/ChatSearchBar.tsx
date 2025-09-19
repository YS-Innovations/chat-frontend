// src/components/ChatWindow/ChatSearchBar.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { X, ArrowUp, ArrowDown } from 'lucide-react';

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
  onClose,
}) => {
  return (
    <div className="absolute top-33 right-25 z-50 shadow-lg rounded-md  bg-white w-[300px] p-2 flex flex-col space-y-2 animate-fade-in">
      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="pr-8 text-sm border border-amber-300"
        />
        {searchQuery && (
          <X
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={onClear}
          />
        )}
      </div>

      {searchQuery && totalMatches > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-600 px-3">
          <span>
            {currentIndex + 1} of {totalMatches}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevious}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              disabled={currentIndex === 0}
              title="Previous"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={onNext}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              disabled={currentIndex === totalMatches - 1}
              title="Next"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSearchBar;
