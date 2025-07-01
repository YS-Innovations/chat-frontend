import { PERMISSION_GROUPS } from "../types";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";

interface PermissionViewProps {
  selectedPermissions: Record<string, boolean>;
  onEdit: () => void;
  canEdit: boolean;
}

export function PermissionView({ selectedPermissions, onEdit, canEdit }: PermissionViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter groups and permissions based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return PERMISSION_GROUPS;
    
    const term = searchTerm.toLowerCase();
    return PERMISSION_GROUPS
      .map(group => ({
        ...group,
        permissions: group.permissions.filter(
          p => (p.label.toLowerCase().includes(term) || 
                p.value.toLowerCase().includes(term)) && 
                selectedPermissions[p.value]
        )
      }))
      .filter(group => group.permissions.length > 0);
  }, [searchTerm, selectedPermissions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Permissions</h2>
        {canEdit && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Accordion type="multiple" className="space-y-4">
          {filteredGroups.map(group => {
            const groupPermissions = group.permissions.filter(
              p => selectedPermissions[p.value]
            );

            if (groupPermissions.length === 0) return null;

            return (
              <AccordionItem 
                key={group.id} 
                value={group.id} 
                className="border rounded-lg bg-card"
              >
                <AccordionTrigger className="p-4 hover:no-underline">
                  <h3 className="font-medium">{group.label}</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {groupPermissions.map(permission => (
                      <div key={permission.id} className="flex items-center p-2 rounded bg-green-50/50">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>{permission.label}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        
        {filteredGroups.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No permissions match your search
          </div>
        )}
      </div>
    </div>
  );
}