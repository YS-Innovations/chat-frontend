import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { PERMISSION_GROUPS } from "../types";
import { Checkbox } from "@/components/ui/indeterminate-checkbox";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Search } from "lucide-react";

interface TemplatePermissionsModalProps {
  template: any;
  open: boolean;
  onClose: () => void;
  onUse: (permissions: Record<string, boolean>, action: 'apply' | 'saveAsTemplate', templateName?: string) => void;
}

export function TemplatePermissionsModal({
  template,
  open,
  onClose,
  onUse,
}: TemplatePermissionsModalProps) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [mode, setMode] = useState<'use' | 'saveAsTemplate'>('use');
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, boolean>>({});
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

  useEffect(() => {
    if (template) {
      const templatePerms = { ...template.policy };
      setPermissions(templatePerms);
      setOriginalPermissions(templatePerms);
      setHasChanges(false);
      setTemplateName('');
      setMode('use');
    }
  }, [template]);

  useEffect(() => {
    if (template && Object.keys(originalPermissions).length > 0) {
      const changed = Object.keys(permissions).some(key =>
        permissions[key] !== originalPermissions[key]
      );
      setHasChanges(changed);
    }
  }, [permissions, template, originalPermissions]);

  const handleTogglePermission = (permissionValue: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permissionValue]: checked
    }));
  };

  const handleGroupToggle = (permissionsList: string[]) => { // Removed groupId
    const allChecked = permissionsList.every(perm => permissions[perm]);
    const newPermissions = { ...permissions };

    permissionsList.forEach(perm => {
      newPermissions[perm] = !allChecked;
    });

    setPermissions(newPermissions);
  };

  const handleSelectAll = () => {
    const newPermissions = { ...permissions };

    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(permission => {
        newPermissions[permission.value] = true;
      });
    });

    setPermissions(newPermissions);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Template: {template?.policyName}</span>
            {template?.duplicateOfId && (
              <span className="text-sm text-muted-foreground font-normal">
                (Duplicate of {template.duplicateOf?.policyName})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                <Check className="h-4 w-4 mr-2" /> Select All
              </Button>
            </div>

            <Accordion type="multiple" className="space-y-4">
              {filteredGroups.map(group => {
                const groupPermissions = group.permissions.map(p => p.value);
                const allChecked = groupPermissions.every(perm => permissions[perm]);
                const someChecked = groupPermissions.some(perm => permissions[perm]);

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
                        {group.permissions.map(permission => (
                          <div key={permission.id} className="flex items-center pl-6">
                            <Checkbox
                              checked={permissions[permission.value] || false}
                              onCheckedChange={checked =>
                                handleTogglePermission(permission.value, !!checked)
                              }
                              className="mr-2"
                            />
                            <label>{permission.label}</label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>

        {mode === 'use' ? (
          <DialogFooter className="pt-4 border-t">
            {!hasChanges ? (
              <Button
                onClick={() => onUse(permissions, 'apply')}
                className="w-full"
              >
                Use and Save
              </Button>
            ) : (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => onUse(permissions, 'apply')}
                  className="flex-1"
                >
                  Apply to Current User
                </Button>
                <Button
                  onClick={() => setMode('saveAsTemplate')}
                  className="flex-1"
                >
                  Save as Template
                </Button>
              </div>
            )}
          </DialogFooter>
        ) : (
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMode('use')}
              >
                Back
              </Button>
              <Button
                onClick={() => onUse(permissions, 'saveAsTemplate', templateName)}
                disabled={!templateName.trim()}
              >
                Save Template and Apply
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}