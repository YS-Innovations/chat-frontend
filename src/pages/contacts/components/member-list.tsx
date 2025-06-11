// src/pages/contacts/components/member-list.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import type { Member } from "../types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface MemberListProps {
  members: Member[];
  loading: boolean;
  error: string | null;
  onSelect: (member: Member) => void; // Add this prop
}

export function MemberList({ members, loading, error, onSelect }: MemberListProps) {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background z-10">
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead className="text-right">Actions</TableHead> {/* Add this */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <MemberRow 
            key={member.id} 
            member={member} 
            onSelect={onSelect} 
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface MemberRowProps {
  member: Member;
  onSelect: (member: Member) => void; // Add this prop
}

function MemberRow({ member, onSelect }: MemberRowProps) {
  return (
    <TableRow 
      className="hover:bg-muted/50 cursor-pointer"
      onClick={() => onSelect(member)}
    >
      <TableCell>
        <Avatar className="h-8 w-8">
          {member.picture && (
            <AvatarImage src={member.picture} alt={member.name || member.email} />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(member.name || member.email)}
          </AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{member.name || 'No name'}</div>
          <div className="text-sm text-muted-foreground">{member.email}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={member.role === 'ADMIN' ? 'destructive' : 'default'}>
          {member.role}
        </Badge>
      </TableCell>
      <TableCell>
        {member.lastLogin 
          ? new Date(member.lastLogin).toLocaleDateString() 
          : 'Never'}
      </TableCell>
      <TableCell className="text-right">
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(member);
          }}
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}