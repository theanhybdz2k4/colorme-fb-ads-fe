export interface User {
  id: number;
  email: string;
  name: string | null;
  isActive: boolean;
  avatarUrl: string | null;
  geminiApiKey: string | null;
  identities: {
    id: number;
    name: string | null;
    externalId: string | null;
    isValid: boolean;
    platform: { name: string; code: string };
    _count: { accounts: number; credentials: number };
  }[];
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; avatar_url?: string; gemini_api_key?: string }) => Promise<void>;
  updatePassword: (data: any) => Promise<void>;
  uploadAvatar: (file: File) => Promise<{ url: string }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
