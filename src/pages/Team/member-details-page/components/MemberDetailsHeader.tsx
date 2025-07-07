// src/pages/Team/member-details-page/components/MemberDetailsHeader.tsx
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MemberDetailsHeaderProps {
  onClose: () => void;
}

export function MemberDetailsHeader({ onClose }: MemberDetailsHeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h2 className="text-lg font-semibold">Member Details</h2>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}