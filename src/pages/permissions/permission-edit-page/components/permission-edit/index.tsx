import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { usePermissionEdit } from "./usePermissionEdit";
import type { PermissionEditProps } from "../../types";
import { PermissionEditHeader } from "./PermissionEditHeader";
import { PermissionSearchBar } from "./PermissionSearchBar";
import { TemplatesSection } from "./TemplatesSection";
import { PermissionGroupItem } from "./PermissionGroupItem";

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

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={props.onCancel}
          disabled={props.saving}
        >
          Cancel
        </Button>
        <Button
          onClick={props.onSaveClick}
          disabled={props.saving || !isDirty}
        >
          {props.saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}