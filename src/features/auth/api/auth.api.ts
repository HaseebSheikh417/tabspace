import { httpClient } from '../../../shared/api';
import type { LoginDto, RegisterDto, RefreshTokenDto } from '../types/auth.dto';
import type { AuthTokens, User } from '../types/auth.types';

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
}

export interface RegisterResponse {
    user: User;
    tokens: AuthTokens;
}

export interface RefreshResponse {
    tokens: AuthTokens;
}

export const authApi = {
    login(dto: LoginDto): Promise<LoginResponse> {
        return httpClient.post<LoginResponse>('/auth/login', dto);
    },

    register(dto: RegisterDto): Promise<RegisterResponse> {
        return httpClient.post<RegisterResponse>('/auth/register', dto);
    },

    refresh(dto: RefreshTokenDto): Promise<RefreshResponse> {
        return httpClient.post<RefreshResponse>('/auth/refresh', dto);
    },

    logout(refreshToken: string): Promise<void> {
        return httpClient.post<void>('/auth/logout', { refreshToken });
    },

    me(): Promise<User> {
        return httpClient.get<User>('/auth/me');
    },
};
