import { useState, useEffect, useMemo } from "react";
import { PERMISSION_GROUPS, type PermissionGroup } from "../../../types/types";
import type { TemplatePermissionsModalProps } from "../types/types";

interface UseTemplatePermissionsModalParams
  extends Pick<TemplatePermissionsModalProps, "template" | "onUse" | "onClose"> {}

export function useTemplatePermissionsModal({
  template,
}: UseTemplatePermissionsModalParams) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [mode, setMode] = useState<"use" | "saveAsTemplate">("use");
  const [originalPermissions, setOriginalPermissions] = useState<
    Record<string, boolean>
  >({});
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups: PermissionGroup[] = useMemo(() => {
    if (!searchTerm) return PERMISSION_GROUPS;

    const term = searchTerm.toLowerCase();
    return PERMISSION_GROUPS
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (p) =>
            p.label.toLowerCase().includes(term) ||
            p.value.toLowerCase().includes(term)
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [searchTerm]);

  useEffect(() => {
    if (template) {
      const templatePerms = { ...template.policy };
      setPermissions(templatePerms);
      setOriginalPermissions(templatePerms);
      setHasChanges(false);
      setTemplateName("");
      setMode("use");
    }
  }, [template]);

  useEffect(() => {
    if (template && Object.keys(originalPermissions).length > 0) {
      const changed = Object.keys(permissions).some(
        (key) => permissions[key] !== originalPermissions[key]
      );
      setHasChanges(changed);
    }
  }, [permissions, template, originalPermissions]);

  const handleTogglePermission = (permissionValue: string, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionValue]: checked,
    }));
  };

  const handleGroupToggle = (permissionsList: string[]) => {
    const allChecked = permissionsList.every((perm) => permissions[perm]);
    const newPermissions = { ...permissions };

    permissionsList.forEach((perm) => {
      newPermissions[perm] = !allChecked;
    });

    setPermissions(newPermissions);
  };

  const handleSelectAll = () => {
    const newPermissions = { ...permissions };

    PERMISSION_GROUPS.forEach((group) => {
      group.permissions.forEach((permission) => {
        newPermissions[permission.value] = true;
      });
    });

    setPermissions(newPermissions);
  };

  return {
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
    template
  };
}
