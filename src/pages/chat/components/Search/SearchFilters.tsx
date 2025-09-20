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
import { Label } from '@/components/ui/label';

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
  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) return '';
    return `${dateString}T00:00:00.000Z`;
  };

  const handleDateChange = (type: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({ [type]: formatDateForBackend(value) });
  };

  const formatDateForDisplay = (isoString?: string): string => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
        <Select
          value={filters.status || "ALL"}
          onValueChange={(value) => {
            onFiltersChange({ status: value === "ALL" ? undefined : value });
          }}
        >
          <SelectTrigger id="status-filter" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Agent Filter */}
      <div className="space-y-2">
        <Label htmlFor="agent-filter" className="text-sm font-medium">Agent</Label>
        <Select
          value={filters.agentId || "ALL"}
          onValueChange={(value) => {
            onFiltersChange({ agentId: value === "ALL" ? undefined : value });
          }}
        >
          <SelectTrigger id="agent-filter" className="w-full">
            <SelectValue placeholder="Select agent" />
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
      </div>

      {/* Assignment Filter */}
      <div className="space-y-2">
        <Label htmlFor="assignment-filter" className="text-sm font-medium">Assignment</Label>
        <Select
          value={
            filters.hasAgent === undefined 
              ? "ALL" 
              : filters.hasAgent 
                ? "true" 
                : "false"
          }
          onValueChange={(value) => {
            onFiltersChange({ hasAgent: value === "ALL" ? undefined : value === "true" });
          }}
        >
          <SelectTrigger id="assignment-filter" className="w-full">
            <SelectValue placeholder="Select assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="true">Assigned</SelectItem>
            <SelectItem value="false">Unassigned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Date Range</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-xs text-muted-foreground">From</Label>
            <Input
              id="start-date"
              type="date"
              value={formatDateForDisplay(filters.startDate)}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-xs text-muted-foreground">To</Label>
            <Input
              id="end-date"
              type="date"
              value={formatDateForDisplay(filters.endDate)}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Clear Button */}
      <Button
        variant="outline"
        onClick={onClear}
        className="w-full mt-4"
      >
        Clear All Filters
      </Button>
    </div>
  );
};

export default SearchFilters;