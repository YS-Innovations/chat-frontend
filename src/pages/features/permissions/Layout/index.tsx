import { Accordion } from "@/components/ui/accordion";
import { PermissionEditHeader } from "./components/PermissionEditHeader";
import { PermissionGroupItem } from "./components/PermissionGroupItem";
import { PermissionEditActions } from "./components/PermissionEditActions";
import { TemplatesSection } from "./components/TemplatesSection";
import { PermissionSearchBar } from "./components/PermissionSearchBar";
import { usePermissionEdit } from "../hooks/usePermissionEditLayout";
import type { PermissionEditProps } from "../../types/types";

export function PermissionEdit(props: PermissionEditProps) {
  const {
    isDirty,
    expandedGroups,
    filteredGroups,
    handleTogglePermission,
    handleGroupToggle,
    handleSelectAll,
    handleClearAll,
    setSearchTerm,
    setExpandedGroups,
  } = usePermissionEdit(props);

  return (
    <div className="space-y-6">
      <PermissionEditHeader
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
      />

      <PermissionSearchBar
        searchTerm={""}
        onSearchChange={setSearchTerm}
      />

      <TemplatesSection
        templates={props.templates}
        onTemplateClick={props.onTemplateClick}
      />

      <Accordion
        type="multiple"
        value={expandedGroups}
        onValueChange={setExpandedGroups}
        className="space-y-4"
      >
        {filteredGroups.map((group) => (
          <PermissionGroupItem
            key={group.id}
            group={group}
            permissionsValue={props.value}
            isExpanded={expandedGroups.includes(group.id)}
            onGroupToggle={handleGroupToggle}
            onPermissionToggle={handleTogglePermission}
          />
        ))}
      </Accordion>

      <PermissionEditActions
        onCancel={props.onCancel}
        onSaveClick={props.onSaveClick}
        saving={props.saving}
        isDirty={isDirty}
      />
    </div>
  );
}