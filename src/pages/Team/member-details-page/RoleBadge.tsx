import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const variant = role === "OWNER" ? "destructive" : "default";

  return (
    <Badge variant={variant} className="mt-3">
      {role}
    </Badge>
  );
}
