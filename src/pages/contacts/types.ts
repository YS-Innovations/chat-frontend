export interface Member {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'AGENT';
  lastLogin: Date | null;
  picture?: string | null;
  createdAt?: Date | null; 
 permissions: Record<string, boolean>; 
}