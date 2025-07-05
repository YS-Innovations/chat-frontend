import { Button } from "@/components/ui/button";
import { PermissionView } from "./components";
import { usePermissionViewPage } from "./usePermissionViewPage";
import { ViewPageSkeleton } from "./components/view-page-skeleton";

export function PermissionViewPage() {
  const {
    permissions,
    loading,
    error,
    handleEdit,
    handleBack
  } = usePermissionViewPage();

  if (loading) return <ViewPageSkeleton />;
  if (error) return <div className="error-view">Error: {error}</div>;

  return (
    <div className="permission-view-page">
      <div className="page-header">
        <h1>View Permissions</h1>
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
      </div>
      <PermissionView 
        selectedPermissions={permissions} 
        onEdit={handleEdit}
        canEdit={true}
      />
    </div>
  );
}