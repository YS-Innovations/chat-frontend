import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PermissionTemplate } from "../../types/types";

interface TemplatesSectionProps {
  templates: PermissionTemplate[];
  onTemplateClick: (id: string) => void;
}

export function TemplatesSection({
  templates,
  onTemplateClick,
}: TemplatesSectionProps) {
  if (templates.length === 0) return null;

  return (
    <div className="border rounded-lg p-4 bg-muted/50">
      <div className="flex items-center mb-2">
        <h3 className="font-medium">Suggestions</h3>
        <span className="ml-2 text-muted-foreground text-sm flex items-center">
          <Info className="h-3 w-3 mr-1" />
          Click to apply
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <Badge
            key={template.id}
            variant="secondary"
            className="cursor-pointer px-3 py-1 hover:bg-accent"
            onClick={() => onTemplateClick(template.id)}
          >
            {template.policyName}
          </Badge>
        ))}
      </div>
    </div>
  );
}