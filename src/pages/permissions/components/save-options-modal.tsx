import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SaveOptionsModalProps {
  open: boolean;
  onClose: () => void;
  onSaveForUser: () => void;
  onSaveAsTemplate: (templateName: string) => void;
  templates: any[];
  permissions: Record<string, boolean>;
  onViewTemplate: (templateId: string) => void;
}

export function SaveOptionsModal({
  open,
  onClose,
  onSaveForUser,
  onSaveAsTemplate,
  templates,
  permissions,
  onViewTemplate
}: SaveOptionsModalProps) {
  const [templateName, setTemplateName] = useState('');
  const [mode, setMode] = useState<'select' | 'template'>('select');
  const [nameError, setNameError] = useState('');
  const [duplicateTemplate, setDuplicateTemplate] = useState<any>(null);

  // Find matching template
  const matchingTemplate = useMemo(() => {
    if (!permissions) return null;
    const permString = JSON.stringify(permissions);
    return templates.find(t => 
      JSON.stringify(t.policy) === permString
    );
  }, [templates, permissions]);

  useEffect(() => {
    if (mode === 'template') {
      // Check for duplicate permissions
      const permString = JSON.stringify(permissions);
      const duplicate = templates.find(t => 
        JSON.stringify(t.policy) === permString
      );
      setDuplicateTemplate(duplicate);
    }
  }, [mode, templates, permissions]);

  const handleSaveTemplate = () => {
    // Validate template name
    if (!templateName.trim()) {
      setNameError('Template name is required');
      return;
    }
    
    // Check for duplicate name
    const nameExists = templates.some(t => 
      t.policyName.toLowerCase() === templateName.toLowerCase()
    );
    
    if (nameExists) {
      setNameError('Template name already exists');
      return;
    }
    
    setNameError('');
    onSaveAsTemplate(templateName);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        {mode === 'select' ? (
          <>
            <DialogHeader>
              <DialogTitle>Save Options</DialogTitle>
              <DialogDescription>
                Choose how to save these permissions
              </DialogDescription>
            </DialogHeader>
            
            {matchingTemplate && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Permissions match existing template:
                </p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    onViewTemplate(matchingTemplate.id);
                    onClose();
                  }}
                >
                  {matchingTemplate.policyName}
                </Button>
              </div>
            )}
            
            <div className="grid gap-4 py-4">
              <Button onClick={() => {
                onSaveForUser();
                onClose();
              }}>
                Save only for this user
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setMode('template')}
              >
                Save as policy template
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Save as Policy Template</DialogTitle>
              <DialogDescription>
                Create a reusable permission template
              </DialogDescription>
            </DialogHeader>
            
            {duplicateTemplate && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Duplicate Permissions Detected</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p>
                    A template with the same permissions already exists:
                  </p>
                  <Badge variant="outline" className="w-fit">
                    {duplicateTemplate.policyName}
                  </Badge>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div>
                <Input
                  placeholder="Template name"
                  value={templateName}
                  onChange={(e) => {
                    setTemplateName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  className={nameError ? 'border-red-500' : ''}
                />
                {nameError && (
                  <p className="text-red-500 text-sm mt-1">{nameError}</p>
                )}
              </div>
              
              <DialogFooter className="sm:justify-start">
                <Button 
                  variant="outline" 
                  onClick={() => setMode('select')}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                >
                  Save Template
                </Button>
              </DialogFooter>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}