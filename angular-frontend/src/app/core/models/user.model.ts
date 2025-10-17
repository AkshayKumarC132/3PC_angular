export interface User {
  id: number;
  email: string;
  name: string;
  username?: string;
  theme: string;
  role: 'admin' | 'user' | 'reviewer';
  is_active?: boolean;
  is_staff?: boolean;
  date_joined?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}