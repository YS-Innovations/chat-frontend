// src/pages/features/permissions/index.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PermissionEdit } from "./Layout";
import { usePermissionEditPage } from "./hooks/usePermissionEditPage";
import type { PermissionEditPageProps } from "./types/types";
import { SaveOptionsModal } from "./Dialog/SaveOptions";
import { TemplatePermissionsModal } from "./Dialog/PolicyPermissions";
import { toast } from "sonner";

export function PermissionEditPage({ userId }: PermissionEditPageProps) {
  const navigate = useNavigate();
  const {
    permissions,
    loading,
    error,
    saving,
    templates,
    saveOptionsOpen,
    templateModalOpen,
    selectedTemplate,
    setPermissions,
    setSaveOptionsOpen,
    setTemplateModalOpen,
    handleSave,
    handleTemplateClick,
    handleUseTemplate,
  } = usePermissionEditPage(userId);

  if (loading) return <div>Loading permissions...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleSaveForUser = async () => {
    try {
      await handleSave(permissions);
      toast.success('Permissions applied successfully');
      navigate(-1); // Go back to permission view page
    } catch (error) {
      toast.error('Failed to apply permissions');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Permissions</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <PermissionEdit
        value={permissions}
        onChange={setPermissions}
        onSaveClick={() => setSaveOptionsOpen(true)}
        onCancel={() => navigate(-1)}
        saving={saving}
        templates={templates}
        onTemplateClick={handleTemplateClick}
      />

      <SaveOptionsModal
        open={saveOptionsOpen}
        onClose={() => setSaveOptionsOpen(false)}
        onSaveForUser={handleSaveForUser}
        onSaveAsTemplate={() => {
          setSaveOptionsOpen(false);
          setTemplateModalOpen(true);
        }}
        templates={templates}
        permissions={permissions}
        onViewTemplate={handleTemplateClick}
      />

      <TemplatePermissionsModal
        template={selectedTemplate || undefined}
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onUse={handleUseTemplate}
      />
    </div>
  );
}