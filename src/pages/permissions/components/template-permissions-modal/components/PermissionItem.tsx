import { Checkbox } from "@/components/ui/indeterminate-checkbox";

interface PermissionItemProps {
  id: string;
  label: string;
  value: string;
  checked: boolean;
  onToggle: (value: string, checked: boolean) => void;
}

export function PermissionItem({
  id,
  label,
  value,
  checked,
  onToggle,
}: PermissionItemProps) {
  return (
    <div className="flex items-center pl-6">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onToggle(value, !!checked)}
        className="mr-2"
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
