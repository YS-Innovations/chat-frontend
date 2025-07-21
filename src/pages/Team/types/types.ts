

export interface Member {
  id: string;
  uuid:string;
  name: string | null;
  email: string;
  role: Role;
  lastLogin: Date | null;
  picture?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  blocked: boolean;
  phoneNumber: string | null;
  identities: any | null;
  metadata: any | null;
  permissions: Record<string, boolean>;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UserLoginHistory {
  id: string;
  userId: string;
  lastIp: string;
  lastLogin: string;
  lastLogoutAt: string | null;
  browserName: string;
  os: string;
  deviceType: string;
}

export interface PermissionHistory {
  id: string;
  changes: {
    previous: Record<string, boolean>;
    current: Record<string, boolean>;
  };
  changedAt: Date;
}
export type Role = 'OWNER' | 'ADMIN' | 'AGENT';


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

export type SortField = 'name' | 'email' | 'role' | 'lastLogin' | 'createdAt' | 'status';

export interface SortingState extends Array<{
  id: SortField;
  desc: boolean;
}> {}