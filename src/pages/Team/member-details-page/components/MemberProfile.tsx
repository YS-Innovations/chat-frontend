// src/pages/Team/member-details-page/components/MemberProfile.tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { Member } from "../../types/types";

interface MemberProfileProps {
  member: Member;
}

export function MemberProfile({ member }: MemberProfileProps) {
  return (
    <div className="flex flex-col items-center mb-4 pt-4">
      <Avatar className="h-24 w-24 mb-4">
        {member.picture && (
          <AvatarImage src={member.picture} alt={member.name || member.email} />
        )}
        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-3xl">
          {getInitials(member.name || member.email)}
        </AvatarFallback>
      </Avatar>

      <h3 className="text-xl font-bold">{member.name || 'No name'}</h3>
      <p className="text-muted-foreground flex items-center mt-1">
        <Mail className="h-4 w-4 mr-2" />
        {member.email}
      </p>

      <Badge
        variant={member.role === 'ADMIN' ? 'destructive' : 'default'}
        className="mt-3"
      >
        {member.role}
      </Badge>
    </div>
  );
}