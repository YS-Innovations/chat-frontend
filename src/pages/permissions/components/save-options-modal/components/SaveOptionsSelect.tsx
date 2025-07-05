import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface SaveOptionsSelectProps {
  onSaveForUser: () => void;
  onSaveAsTemplateMode: () => void;
  onClose: () => void;
  matchingTemplate?: { id: string; policyName: string } | null;
  onViewTemplate: (id: string) => void;
}

export function SaveOptionsSelect({
  onSaveForUser,
  onSaveAsTemplateMode,
  onClose,
  matchingTemplate,
  onViewTemplate,
}: SaveOptionsSelectProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Save Options</DialogTitle>
        <DialogDescription>Choose how to save these permissions</DialogDescription>
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
          onClick={onSaveAsTemplateMode}
          className="justify-start"
        >
          Save as policy template
        </Button>
      </div>
    </>
  );
}
