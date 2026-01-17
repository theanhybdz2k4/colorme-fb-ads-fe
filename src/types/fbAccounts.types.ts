export interface FbAccount {
  id: number;
  name: string | null;
  fbUserId: string | null;
  isValid: boolean;
  _count: { adAccounts: number; tokens: number };
  tokens: FbToken[];
}

export interface FbToken {
  id: number;
  name: string;
  isDefault: boolean;
  isValid: boolean;
}

export interface AddFbAccountParams {
  accessToken: string;
  name?: string;
}

export interface AddTokenParams {
  id: number;
  accessToken: string;
  name?: string;
  isDefault?: boolean;
}
