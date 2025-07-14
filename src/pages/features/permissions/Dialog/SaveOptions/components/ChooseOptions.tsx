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
}: SaveOptionsSelectProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Save Options</DialogTitle>
        <DialogDescription>Choose how to save these permissions</DialogDescription>
      </DialogHeader>

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
