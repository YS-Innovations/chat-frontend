import { useNavigate, useParams } from "react-router-dom";
import { PermissionEdit } from "../components/permission-edit";
import { SaveOptionsModal } from "../components/save-options-modal";
import { TemplatePermissionsModal } from "../components/template-permissions-modal";
import { usePermissionEditPage } from "./usePermissionEditPage";
import { Button } from "@/components/ui/button";

export function PermissionEditPage() {
  const { userId } = useParams();
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
    handleUseTemplate
  } = usePermissionEditPage(userId);

  if (loading) return <div className="text-center py-8">Loading permissions...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

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
        onSaveForUser={() => handleSave(permissions)}
        onSaveAsTemplate={() => handleSave(permissions)}
        templates={templates}
        permissions={permissions}
        onViewTemplate={handleTemplateClick}
      />
      
      <TemplatePermissionsModal
        template={selectedTemplate}
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onUse={handleUseTemplate}
      />
    </div>
  );
}