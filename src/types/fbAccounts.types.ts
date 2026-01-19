export interface PlatformIdentity {
  id: number;
  userId: number;
  platformId: number;
  externalId: string;
  name: string | null;
  isValid: boolean;
  platform: {
    id: number;
    code: string;
    name: string;
  };
  _count: {
    accounts: number;
    credentials: number;
  };
  fbUserId?: string | null;
}

// Compatibility alias
export type FbAccount = PlatformIdentity;

export interface FbToken {
  id: number;
  name: string;
  isDefault: boolean;
  isValid: boolean;
}

export interface AddFbAccountParams {
  platformCode: string;
  accessToken: string;
  name?: string;
}

export interface AddTokenParams {
  id: number;
  accessToken: string;
  name?: string;
  isDefault?: boolean;
}
