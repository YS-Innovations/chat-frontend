// src/pages/chat/components/Search/SearchFilters.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: SearchFiltersState;
  onFiltersChange: (filters: Partial<SearchFiltersState>) => void;
  onClear: () => void;
  availableAgents: Array<{ id: string; name: string | null; email: string | null }>;
  onCloseSheet?: () => void;
}

export interface SearchFiltersState {
  status?: string;
  agentId?: string;
  hasAgent?: boolean;
  startDate?: string;
  endDate?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
  availableAgents,
  onCloseSheet,
}) => {
  const formatDateForBackend = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toISOString();
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    onFiltersChange({
      startDate: range?.from ? formatDateForBackend(range.from) : undefined,
      endDate: range?.to ? formatDateForBackend(range.to) : undefined,
    });
  };

  const getDateRange = () => {
    if (!filters.startDate && !filters.endDate) return undefined;
    
    return {
      from: filters.startDate ? new Date(filters.startDate) : undefined,
      to: filters.endDate ? new Date(filters.endDate) : undefined,
    };
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ status: value === "ALL" ? undefined : value });
  };

  const handleAgentChange = (value: string) => {
    onFiltersChange({ agentId: value === "ALL" ? undefined : value });
  };

  const handleAssignmentChange = (value: string) => {
    onFiltersChange({ hasAgent: value === "ALL" ? undefined : value === "true" });
  };

  const handleApplyFilters = () => {
    if (onCloseSheet) {
      onCloseSheet();
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
        <Select
          value={filters.status || "ALL"}
          onValueChange={handleStatusChange}
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
          onValueChange={handleAgentChange}
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
          onValueChange={handleAssignmentChange}
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

      {/* Date Range Filter with Calendar */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                (!filters.startDate && !filters.endDate) && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.startDate && filters.endDate ? (
                `${format(new Date(filters.startDate), 'MMM dd, yyyy')} - ${format(new Date(filters.endDate), 'MMM dd, yyyy')}`
              ) : (
                "Pick a date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={getDateRange()?.from}
              selected={getDateRange()}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          onClick={onClear}
          className="flex-1"
        >
          Clear All
        </Button>
        <Button
          onClick={handleApplyFilters}
          className="flex-1"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default SearchFilters;