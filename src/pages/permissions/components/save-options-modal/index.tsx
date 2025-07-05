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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useSaveOptionsModal } from "./useSaveOptionsModal";
import type { SaveOptionsModalProps } from "../../types";

export function SaveOptionsModal({
  open,
  onClose,
  onSaveForUser,
  onSaveAsTemplate,
  templates,
  permissions,
  onViewTemplate
}: SaveOptionsModalProps) {
  const {
    templateName,
    mode,
    nameError,
    duplicateTemplate,
    matchingTemplate,
    handleSaveTemplate,
    setTemplateName,
    setMode,
    setNameError // Add the error setter
  } = useSaveOptionsModal({
    open,
    templates,
    permissions,
    onSaveAsTemplate,
    onClose
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
            
            <div className="grid gap-3 py-4">
              <Button 
                onClick={() => {
                  onSaveForUser();
                  onClose();
                }}
                className="justify-start"
              >
                <Check className="h-4 w-4 mr-2" />
                Save only for this user
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setMode('template')}
                className="justify-start"
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