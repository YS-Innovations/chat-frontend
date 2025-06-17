import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { PERMISSION_GROUPS } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

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

  useEffect(() => {
    if (template) {
      // Create a copy of template permissions
      const templatePerms = {...template.policy};
      setPermissions(templatePerms);
      setOriginalPermissions(templatePerms);
      setHasChanges(false);
      setTemplateName('');
      setMode('use');
    }
  }, [template]);

  useEffect(() => {
    // Check for changes when permissions update
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Template: {template?.policyName}
            {template?.duplicateOfId && (
              <span className="ml-3 text-sm text-muted-foreground font-normal">
                (Duplicate of {template.duplicateOf?.policyName})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {PERMISSION_GROUPS.map(group => (
            <div key={group.id} className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">{group.label}</h3>
              <div className="space-y-2">
                {group.permissions.map(permission => (
                  <div key={permission.id} className="flex items-center">
                    <Checkbox
                      checked={permissions[permission.value] || false}
                      onCheckedChange={(checked) => 
                        handleTogglePermission(permission.value, !!checked)
                      }
                      className="mr-2"
                    />
                    <label>{permission.label}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {mode === 'use' ? (
          <DialogFooter>
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
                  Current User Only Apply
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
          <div className="space-y-4">
            <Input
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="mt-4"
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