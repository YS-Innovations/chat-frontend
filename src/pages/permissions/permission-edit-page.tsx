import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useParams, useNavigate } from 'react-router-dom';
import { PermissionEdit } from './components/permission-edit';
import { Button } from '@/components/ui/button';
import { SaveOptionsModal } from './components/save-options-modal';
import { TemplatePermissionsModal } from './components/template-permissions-modal';
import { PERMISSION_GROUPS } from './types';
import type { Role } from '../Team/types/types';
export function PermissionEditPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [targetUserRole, setTargetUserRole] = useState<Role | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [saveOptionsOpen, setSaveOptionsOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();

        // Fetch templates
      const templatesResponse = await fetch(
          'http://localhost:3000/templates',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);


        // Fetch target user info
        const userResponse = await fetch(
          `http://localhost:3000/auth/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const userData = await userResponse.json();
        setTargetUserRole(userData.role);

        if (userData.role === 'ADMIN') {
          setError('Cannot edit permissions for admin users');
          setLoading(false);
          return;
        }

        // Fetch permissions
        const permResponse = await fetch(
          `http://localhost:3000/auth/permissions/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!permResponse.ok) throw new Error('Failed to fetch permissions');
        const permData = await permResponse.json();
        
        // Convert array to permission object
        const permissionsObj = PERMISSION_GROUPS.reduce((acc, group) => {
          group.permissions.forEach(permission => {
            acc[permission.value] = permData.permissions.includes(permission.value);
          });
          return acc;
        }, {} as Record<string, boolean>);
        
        
        setPermissions(permissionsObj);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, getAccessTokenSilently]);

  const handleSave = async (updatedPermissions: Record<string, boolean>) => {
    setSaving(true);
    try {
      const token = await getAccessTokenSilently();
      
      // Convert permission object to array
      const permissionsArray = Object.entries(updatedPermissions)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      const response = await fetch(
        `http://localhost:3000/auth/permissions/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissions: permissionsArray }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save permissions');
      }
      
      setPermissions(updatedPermissions);
      navigate(-1); // Go back after save
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateClick = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setTemplateModalOpen(true);
    }
  };

  const handleUseTemplate = (perms: Record<string, boolean>, action: 'apply' | 'saveAsTemplate', name?: string) => {
    if (action === 'apply') {
      setPermissions(perms);
      setSaveOptionsOpen(true);
    } else if (action === 'saveAsTemplate' && name) {
      // Save template logic would go here
      setPermissions(perms);
      setSaveOptionsOpen(true);
    }
  };

  if (loading) return <div className="text-center py-8">Loading permissions...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  const arrayToPermissionObject = (permissionsArray: string[]): Record<string, boolean> => {
    return PERMISSION_GROUPS.reduce((acc: Record<string, boolean>, group) => {
      group.permissions.forEach(permission => {
        acc[permission.value] = permissionsArray.includes(permission.value);
      });
      return acc;
    }, {});
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
        onSaveForUser={() => handleSave(permissions)}
        onSaveAsTemplate={(name) => {
          // Save template logic would go here
          handleSave(permissions);
        }}
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

