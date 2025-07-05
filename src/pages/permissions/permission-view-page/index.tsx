import { useNavigate, useParams } from "react-router-dom";
import { PermissionView } from "../components/permission-view";
import { Button } from "@/components/ui/button";
import { usePermissionViewPage } from "./usePermissionViewPage";

export function PermissionViewPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const {
    permissions,
    loading,
    error
  } = usePermissionViewPage(userId);

  if (loading) return <div className="text-center py-8">Loading permissions...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">View Permissions</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      <PermissionView 
        selectedPermissions={permissions} 
        onEdit={() => navigate(`/permissions/edit/${userId}`)}
        canEdit={true}
      />
    </div>
  );
}