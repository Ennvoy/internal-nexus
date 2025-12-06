export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  PARTNER = 'PARTNER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  targetAudience: string[]; // e.g., 'CS', 'Marketing', 'Ops'
  status: 'ONLINE' | 'TESTING' | 'OFFLINE';
  videoUrl?: string; // YouTube or MP4 link
  docContent?: string; // Markdown or HTML
  docFile?: {
    name: string;
    dataUrl: string;
    mime?: string;
  };
  position?: number;
  updatedAt: string;
}

export interface PartnerLink {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  visibleTo: UserRole[]; // Who can see this
  isActive: boolean;
  position?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
