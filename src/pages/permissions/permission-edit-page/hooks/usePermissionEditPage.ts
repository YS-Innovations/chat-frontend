import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import type { PermissionValue, PermissionTemplate } from "../types";
import { arrayToPermissionObject } from '../../utils';
import { 
  fetchTemplates, 
  fetchUser, 
  fetchUserPermissions, 
  saveUserPermissions 
} from './api';

export function usePermissionEditPage(userId?: string) {
  const { getAccessTokenSilently } = useAuth0();
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
    action: 'apply' | 'saveAsTemplate', 
    name?: string
  ) => {
    if (action === 'apply') {
      setPermissions(perms);
      setSaveOptionsOpen(true);
    } else if (action === 'saveAsTemplate' && name) {
      // Save template logic here
    }
  }, []);

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
