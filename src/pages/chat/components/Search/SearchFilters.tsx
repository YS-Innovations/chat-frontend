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
// import { ConversationStatus } from '@prisma/client';

interface SearchFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: SearchFiltersState;
  onFiltersChange: (filters: Partial<SearchFiltersState>) => void;
  onClear: () => void;
  availableAgents: Array<{ id: string; name: string | null; email: string | null }>;
}

export interface SearchFiltersState {
//   status?: ConversationStatus;
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
          {/* {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ status: undefined })}
              />
            </Badge>
          )} */}
          {filters.agentId && (
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
              {filters.startDate} - {filters.endDate}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* <Select
          value={filters.status || ''}
          onValueChange={(value) => onFiltersChange({ 
            status: value as ConversationStatus || undefined 
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select> */}

        <Select
          value={filters.agentId || ''}
          onValueChange={(value) => onFiltersChange({ agentId: value || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All agents</SelectItem>
            {availableAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name || agent.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

         <Select
          value={filters.hasAgent?.toString() || ''}
          onValueChange={(value) => {
            let hasAgentValue: boolean | undefined;
            if (value === 'true') hasAgentValue = true;
            else if (value === 'false') hasAgentValue = false;
            else hasAgentValue = undefined;
            
            onFiltersChange({ hasAgent: hasAgentValue });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="true">Assigned</SelectItem>
            <SelectItem value="false">Unassigned</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="date"
            placeholder="Start date"
            value={filters.startDate || ''}
            onChange={(e) => onFiltersChange({ startDate: e.target.value })}
            className="text-sm"
          />
          <Input
            type="date"
            placeholder="End date"
            value={filters.endDate || ''}
            onChange={(e) => onFiltersChange({ endDate: e.target.value })}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;