import { User, UserRole } from '../entities/user.entity';

export interface RegisterResponse {
  user: Omit<User, 'password'>;
  message: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: number;
}
