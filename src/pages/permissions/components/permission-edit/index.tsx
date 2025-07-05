import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/indeterminate-checkbox";
import { Badge } from "@/components/ui/badge";
import { Info, Search, Check } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { usePermissionEdit } from "./usePermissionEdit";
import type { PermissionEditProps } from "../../types";

export function PermissionEdit(props: PermissionEditProps) {
  const {
    isDirty,
    expandedGroups,
    searchTerm,
    filteredGroups,
    handleTogglePermission,
    handleGroupToggle,
    handleSelectAll,
    handleClearAll,
    setSearchTerm,
    setExpandedGroups
  } = usePermissionEdit(props);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Edit Permissions</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            <Check className="h-4 w-4 mr-2" /> Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
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

      {props.templates.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center mb-2">
            <h3 className="font-medium">Suggestions</h3>
            <span className="ml-2 text-muted-foreground text-sm flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Click to apply
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {props.templates.map(template => (
              <Badge
                key={template.id}
                variant="secondary"
                className="cursor-pointer px-3 py-1 hover:bg-accent"
                onClick={() => props.onTemplateClick(template.id)}
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
          const allChecked = groupPermissions.every(perm => props.value[perm]);
          const someChecked = groupPermissions.some(perm => props.value[perm]);

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
                    onCheckedChange={() => handleGroupToggle(groupPermissions)}
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
                    const isDisabled = isViewPermission && props.value["permission-edit"];

                    return (
                      <div key={permission.id} className="flex items-center pl-6">
                        <Checkbox
                          checked={props.value[permission.value] || false}
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
        <Button variant="outline" onClick={props.onCancel} disabled={props.saving}>
          Cancel
        </Button>
        <Button onClick={props.onSaveClick} disabled={props.saving || !isDirty}>
          {props.saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}