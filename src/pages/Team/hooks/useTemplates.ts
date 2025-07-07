import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Member } from "../types";

export function useTemplates(member: Member, getAccessTokenSilently: () => Promise<string>, isEditing: boolean) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [matchingTemplate, setMatchingTemplate] = useState<any | null>(null);

  const fetchTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/auth/permissions/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error("Error loading templates");
    } finally {
      setTemplatesLoading(false);
    }
  }, [getAccessTokenSilently]);

  const handleTemplateClick = useCallback(async (templateId: string) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:3000/auth/permissions/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch template');
      const data = await response.json();
      setMatchingTemplate(data);
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error("Error loading template");
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (!isEditing && templates.length > 0) {
      const match = templates.find(t => JSON.stringify(t.policy) === JSON.stringify(member.permissions));
      setMatchingTemplate(match || null);
    }
  }, [isEditing, templates, member.permissions]);

  return {
    templates,
    templatesLoading,
    matchingTemplate,
    fetchTemplates,
    handleTemplateClick
  };
}
