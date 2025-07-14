import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SaveOptionsTemplateProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  nameError: string;
  duplicateTemplate?: { policyName: string } | null;
  onBack: () => void;
  onSaveTemplate: () => void;
}

export function SaveOptionsTemplate({
  templateName,
  setTemplateName,
  nameError,
  duplicateTemplate,
  onBack,
  onSaveTemplate,
}: SaveOptionsTemplateProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Save as Policy Template</DialogTitle>
        <DialogDescription>Create a reusable permission template</DialogDescription>
      </DialogHeader>

      {duplicateTemplate && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Duplicate Permissions Detected</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>A template with the same permissions already exists:</p>
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
            onChange={(e) => setTemplateName(e.target.value)}
            className={nameError ? "border-red-500" : ""}
          />
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onSaveTemplate} disabled={!templateName.trim()}>
            Save Template
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}
