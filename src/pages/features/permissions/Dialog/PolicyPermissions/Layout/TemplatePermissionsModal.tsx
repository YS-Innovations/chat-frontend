import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Accordion } from "@/components/ui/accordion";
import { Check, Search } from "lucide-react";

import { useTemplatePermissionsModal } from "../hooks/useTemplatePermissionsModal";
import type { TemplatePermissionsModalProps } from "../types/types";
import { PermissionGroup } from "./PermissionGroup";

export function TemplatePermissionsModal({
  template,
  open,
  onClose,
  onUse,
}: TemplatePermissionsModalProps) {
  const {
    permissions,
    hasChanges,
    templateName,
    mode,
    filteredGroups,
    handleTogglePermission,
    handleGroupToggle,
    handleSelectAll,
    setTemplateName,
    setMode,
    setSearchTerm,
  } = useTemplatePermissionsModal({ template, onUse, onClose });

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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                <Check className="h-4 w-4 mr-2" /> Select All
              </Button>
            </div>

            <Accordion type="multiple" className="space-y-4">
              {filteredGroups.map((group) => (
                <PermissionGroup
                  key={group.id}
                  id={group.id}
                  label={group.label}
                  permissions={group.permissions}
                  permissionsState={permissions}
                  onToggleGroup={handleGroupToggle}
                  onTogglePermission={handleTogglePermission}
                />
              ))}
            </Accordion>
          </div>
        </div>

        {mode === "use" ? (
          <DialogFooter className="pt-4 border-t">
            {!hasChanges ? (
              <Button onClick={() => onUse(permissions, "apply")} className="w-full">
                Use and Save
              </Button>
            ) : (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => onUse(permissions, "apply")}
                  className="flex-1"
                >
                  Apply to Current User
                </Button>
                <Button onClick={() => setMode("saveAsTemplate")} className="flex-1">
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
              <Button variant="outline" onClick={() => setMode("use")}>
                Back
              </Button>
              <Button
                onClick={() => onUse(permissions, "saveAsTemplate", templateName)}
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
