import React, { useEffect, useRef, useState } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
import { PERMISSION_GROUPS } from '../../features/permissions/types/types';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { ColumnDef } from '@tanstack/react-table';

interface Template {
  id: string;
  policyName: string;
  createdAt: string;
  policy?: Record<string, boolean>;
}

export const PermissionTemplates: React.FC = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuthShared();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newTemplateMode, setNewTemplateMode] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: 'policyName',
      header: 'Template Name',
      cell: ({ row }) => (
        <div
          className="font-medium cursor-pointer hover:text-primary"
          onClick={() => handleSelectTemplate(row.original)}
        >
          {row.original.policyName}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  useEffect(() => {
    const initialPermissions: Record<string, boolean> = {};
    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(permission => {
        initialPermissions[permission.value] = false;
      });
    });
    setPermissions(initialPermissions);
  }, []);

  const hasFetchedTemplates = useRef(false);

  const fetchTemplates = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${backendUrl}/auth/permissions/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedTemplates.current && isAuthenticated) {
      fetchTemplates();
      hasFetchedTemplates.current = true;
    }
  }, [isAuthenticated, getAccessTokenSilently]);
  const loadTemplateDetails = async (id: string) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${backendUrl}/auth/permissions/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch template detail');
      const data = await res.json();
      setSelectedTemplate(data);
      setTemplateName(data.policyName);
      setPermissions(data.policy || {});
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setEditMode(false);
    setNewTemplateMode(false);
    loadTemplateDetails(template.id);
  };

  const handlePermissionChange = (permissionValue: string, checked: boolean) => {
    setPermissions(prev => ({ ...prev, [permissionValue]: checked }));
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${backendUrl}/auth/permissions/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ policyName: templateName, policy: permissions }),
      });

      if (!res.ok) throw new Error(await res.text());
      setSuccessMessage('Template created successfully');
      setNewTemplateMode(false);
      fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${backendUrl}/auth/permissions/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ policyName: templateName, policy: permissions }),
      });

      if (!res.ok) throw new Error(await res.text());
      setSuccessMessage('Template updated successfully');
      setEditMode(false);
      fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate || !window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${backendUrl}/auth/permissions/templates/${selectedTemplate.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(await res.text());
      setSuccessMessage('Template deleted successfully');
      setSelectedTemplate(null);
      setEditMode(false);
      fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleNewTemplateClick = () => {
    const initialPermissions: Record<string, boolean> = {};
    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(permission => {
        initialPermissions[permission.value] = false;
      });
    });
    setTemplateName('');
    setPermissions(initialPermissions);
    setNewTemplateMode(true);
    setEditMode(false);
    setSelectedTemplate(null);
  };

  const renderPermissionsGrid = () => (
    <div className="space-y-4">
      {PERMISSION_GROUPS.map(group => (
        <Card key={group.id}>
          <CardHeader className="p-4 pb-2">
            <h4 className="font-medium">{group.label}</h4>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {group.permissions.map(permission => (
                <div key={permission.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.value}
                    checked={permissions[permission.value] || false}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission.value, checked as boolean)
                    }
                    disabled={!editMode && !newTemplateMode}
                  />
                  <Label htmlFor={permission.value}>{permission.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Permission Templates</h1>
        <Button onClick={handleNewTemplateClick}>
          New Template
        </Button>
      </div>

      {successMessage && (
        <Alert variant="default">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Saved Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable<Template>
                  columns={columns}
                  data={templates}
                  totalCount={templates.length}
                  loading={false}
                  error={null}
                  pageIndex={0}
                  pageSize={templates.length}
                  setPageIndex={() => { }}
                  setPageSize={() => { }}
                  sorting={[]}
                  setSorting={() => { }}
                  enableRowSelection={false}
                  emptyState={
                    <div className="p-4 text-center text-muted-foreground">
                      No templates found
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-1/3" />
                      <div className="grid grid-cols-2 gap-2">
                        {[...Array(4)].map((_, j) => (
                          <Skeleton key={j} className="h-4 w-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : newTemplateMode ? (
                <>
                  <h2 className="text-xl font-semibold">Create New Template</h2>
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Permissions</h3>
                    {renderPermissionsGrid()}
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={handleCreateTemplate}>
                      Create Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setNewTemplateMode(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : selectedTemplate ? (
                <>
                  <div className="flex justify-between items-center">
                    {editMode ? (
                      <div className="space-y-2 w-full">
                        <Label htmlFor="editTemplateName">Template Name</Label>
                        <Input
                          id="editTemplateName"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                        />
                      </div>
                    ) : (
                      <h2 className="text-xl font-semibold">{selectedTemplate.policyName}</h2>
                    )}
                    {!editMode && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditMode(true)}
                        >
                          Update
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteTemplate}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-muted-foreground">
                    Created: {new Date(selectedTemplate.createdAt).toLocaleString()}
                  </p>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Permissions</h3>
                    {renderPermissionsGrid()}
                  </div>

                  {editMode && (
                    <div className="flex space-x-3">
                      <Button onClick={handleUpdateTemplate}>
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {templates.length > 0
                      ? 'Select a template to view details'
                      : 'Create your first template to get started'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};