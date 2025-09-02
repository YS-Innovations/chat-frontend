import { useState, useEffect, useCallback } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
import { useNavigate } from 'react-router-dom';
import { arrayToPermissionObject } from '../helper/utils';
import { 
  fetchTemplates, 
  fetchUser, 
  fetchUserPermissions, 
  saveUserPermissions, 
  updateTemplate
} from '../Api/api';
import type { PermissionTemplate, PermissionValue } from '../types/types';
import { toast } from 'sonner';

export function usePermissionEditPage(userId?: string) {
  const { getAccessTokenSilently } = useAuthShared();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<PermissionValue>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [saveOptionsOpen, setSaveOptionsOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();

      const templatesData = await fetchTemplates(token);
      setTemplates(templatesData);

      if (userId) {
        const userData = await fetchUser(token, userId);

        if (userData.role === 'ADMIN') {
          setError('Cannot edit permissions for admin users');
          return;
        }

        const permData = await fetchUserPermissions(token, userId);
        setPermissions(arrayToPermissionObject(permData.permissions));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId, getAccessTokenSilently]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  const handleSave = useCallback(async (updatedPermissions: PermissionValue) => {
    setSaving(true);
    try {
      const token = await getAccessTokenSilently();
      const permissionsArray = Object.entries(updatedPermissions)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      await saveUserPermissions(token, userId!, permissionsArray);
      setPermissions(updatedPermissions);
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }, [userId, getAccessTokenSilently, navigate]);

  const handleTemplateClick = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setTemplateModalOpen(true);
    }
  }, [templates]);

  const handleUseTemplate = useCallback((
    perms: PermissionValue, 
    action: 'apply' | 'saveAsTemplate' | 'updateTemplate', 
    name?: string
  ) => {
    if (action === 'apply') {
      setPermissions(perms);
      setSaveOptionsOpen(true);
    } else if (action === 'saveAsTemplate' && name) {
      // Save template logic here
    } else if (action === 'updateTemplate' && selectedTemplate) {
      // Update template logic
      const updateTemplatePermissions = async () => {
        try {
          const token = await getAccessTokenSilently();
          await updateTemplate(token, selectedTemplate.id, { policy: perms });
          toast.success('Template updated successfully');
        } catch (error) {
          toast.error('Failed to update template');
        }
      };
      updateTemplatePermissions();
    }
  }, [selectedTemplate, getAccessTokenSilently]);
  return {
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
  };
}
