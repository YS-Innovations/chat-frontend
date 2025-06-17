export interface Member {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'AGENT';
  lastLogin: Date | null;
  picture?: string | null;
  createdAt?: Date | null; 
 permissions: Record<string, boolean>; 
 status: 'ACTIVE' | 'INACTIVE';
}




export interface InactiveMember {
  usedAt: string | number | Date;
  id: string;
  email: string;
  invitedBy: {
    name: string | null;
    email: string;
  } | null;
  createdAt: Date;
  expiresAt: Date;
  status: string;
}