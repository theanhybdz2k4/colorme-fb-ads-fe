export interface User {
  id: number;
  email: string;
  name: string | null;
  isActive: boolean;
  fbAccounts: {
    id: number;
    name: string | null;
    fbUserId: string | null;
    isValid: boolean;
    _count: { adAccounts: number; tokens: number };
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
