import { Button } from "@/components/ui/button";
import { PERMISSION_GROUPS } from "../types";
import { Checkbox } from "@/components/ui/indeterminate-checkbox";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Info, Search, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

interface PermissionEditProps {
  value: Record<string, boolean>;
  onChange: (permissions: Record<string, boolean>) => void;
  onSaveClick: () => void;
  onCancel: () => void;
  saving: boolean;
  templates: any[];
  onTemplateClick: (templateId: string) => void;
}

export function PermissionEdit({
  value,
  onChange,
  onSaveClick,
  onCancel,
  saving,
  templates,
  onTemplateClick,
}: PermissionEditProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter groups and permissions based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return PERMISSION_GROUPS;

    const term = searchTerm.toLowerCase();
    return PERMISSION_GROUPS
      .map(group => ({
        ...group,
        permissions: group.permissions.filter(
          p => p.label.toLowerCase().includes(term) ||
            p.value.toLowerCase().includes(term)
        )
      }))
      .filter(group => group.permissions.length > 0);
  }, [searchTerm]);

  const handleTogglePermission = (permissionValue: string, checked: boolean) => {
    let newPermissions = { ...value, [permissionValue]: checked };

    // Enforce dependency: permission-edit implies permission-view
    if (permissionValue === "permission-edit" && checked) {
      newPermissions["permission-view"] = true;
    }

    onChange(newPermissions);
    setIsDirty(true);
  };

  const handleGroupToggle = (permissions: string[]) => { // Removed groupId
    const allChecked = permissions.every(perm => value[perm]);
    const newPermissions = { ...value };

    permissions.forEach(perm => {
      newPermissions[perm] = !allChecked;
    });

    onChange(newPermissions);
    setIsDirty(true);
  };

  const handleSelectAll = () => {
    const newPermissions = { ...value };

    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(permission => {
        newPermissions[permission.value] = true;
      });
    });

    onChange(newPermissions);
    setIsDirty(true);
  };

  const handleClearAll = () => {
    const newPermissions = { ...value };

    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(permission => {
        newPermissions[permission.value] = false;
      });
    });

    onChange(newPermissions);
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Edit Permissions</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            <Check className="h-4 w-4 mr-2" /> Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </div>
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

      {templates.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center mb-2">
            <h3 className="font-medium">Suggestions</h3>
            <span className="ml-2 text-muted-foreground text-sm flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Click to apply
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map(template => (
              <Badge
                key={template.id}
                variant="secondary"
                className="cursor-pointer px-3 py-1 hover:bg-accent"
                onClick={() => onTemplateClick(template.id)}
              >
                {template.policyName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Accordion
        type="multiple"
        value={expandedGroups}
        onValueChange={setExpandedGroups}
        className="space-y-4"
      >
        {filteredGroups.map(group => {
          const groupPermissions = group.permissions.map(p => p.value);
          const allChecked = groupPermissions.every(perm => value[perm]);
          const someChecked = groupPermissions.some(perm => value[perm]);

          return (
            <AccordionItem
              key={group.id}
              value={group.id}
              className="border rounded-lg bg-card"
            >
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={allChecked}
                    indeterminate={someChecked && !allChecked}
                    onCheckedChange={() =>
                      handleGroupToggle(groupPermissions)
                    }
                    className="mr-2"
                    onClick={e => e.stopPropagation()}
                  />
                  <h3 className="font-medium">{group.label}</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {group.permissions.map(permission => {
                    const isViewPermission = permission.value === "permission-view";
                    const isDisabled = isViewPermission && value["permission-edit"];

                    return (
                      <div key={permission.id} className="flex items-center pl-6">
                        <Checkbox
                          checked={value[permission.value] || false}
                          onCheckedChange={checked =>
                            handleTogglePermission(permission.value, !!checked)
                          }
                          className="mr-2"
                          disabled={isDisabled}
                        />
                        <label className={isDisabled ? "text-muted-foreground" : ""}>
                          {permission.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSaveClick} disabled={saving || !isDirty}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}