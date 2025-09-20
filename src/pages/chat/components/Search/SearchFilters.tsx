// src/pages/chat/components/Search/SearchFilters.tsx
import React from 'react';
import { X, Calendar, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SearchFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: SearchFiltersState;
  onFiltersChange: (filters: Partial<SearchFiltersState>) => void;
  onClear: () => void;
  availableAgents: Array<{ id: string; name: string | null; email: string | null }>;
}

export interface SearchFiltersState {
  status?: string;
  agentId?: string;
  hasAgent?: boolean;
  startDate?: string;
  endDate?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onClear,
  availableAgents,
}) => {
  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  // Convert date to ISO string with time component
  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) return '';
    // Add time component to make it a full ISO datetime
    return `${dateString}T00:00:00.000Z`;
  };

  const handleDateChange = (type: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({ [type]: formatDateForBackend(value) });
  };

  // Format dates for display in input fields (remove time component)
  const formatDateForDisplay = (isoString?: string): string => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      {/* Search Input */}
      <div className="relative">
        <Input
          placeholder="Search..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10"
        />
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ status: undefined })}
              />
            </Badge>
          )}
          {filters.agentId && filters.agentId !== "ALL" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Agent: {availableAgents.find(a => a.id === filters.agentId)?.name || filters.agentId}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ agentId: undefined })}
              />
            </Badge>
          )}
          {filters.hasAgent !== undefined && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Has Agent: {filters.hasAgent ? 'Yes' : 'No'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ hasAgent: undefined })}
              />
            </Badge>
          )}
          {(filters.startDate || filters.endDate) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateForDisplay(filters.startDate)} - {formatDateForDisplay(filters.endDate)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ startDate: undefined, endDate: undefined })}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={onClear} className="h-6 px-2">
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Status Filter */}
        <Select
          value={filters.status || "ALL"}
          onValueChange={(value) => {
            if (value === "ALL") {
              onFiltersChange({ status: undefined });
            } else {
              onFiltersChange({ status: value });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Agent Filter */}
        <Select
          value={filters.agentId || "ALL"}
          onValueChange={(value) => {
            if (value === "ALL") {
              onFiltersChange({ agentId: undefined });
            } else {
              onFiltersChange({ agentId: value });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All agents</SelectItem>
            {availableAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name || agent.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assignment Filter - Fix this to use boolean values */}
        <Select
          value={
            filters.hasAgent === undefined 
              ? "ALL" 
              : filters.hasAgent 
                ? "true" 
                : "false"
          }
          onValueChange={(value) => {
            if (value === "ALL") {
              onFiltersChange({ hasAgent: undefined });
            } else {
              onFiltersChange({ hasAgent: value === "true" });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="true">Assigned</SelectItem>
            <SelectItem value="false">Unassigned</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Filters */}
        <div className="flex gap-2 col-span-2">
          <Input
            type="date"
            placeholder="Start date"
            value={formatDateForDisplay(filters.startDate)}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="text-sm"
          />
          <Input
            type="date"
            placeholder="End date"
            value={formatDateForDisplay(filters.endDate)}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;