// write code to localy simultate auth.api.ts
// using localStorage instead of httpClient
// and using mock data for users.

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

const users: User[] = [
    {
        id: '1',
        name: 'John Doe',
        username: 'john.doe',
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
    },
    {
        id: '2',
        name: 'Jane Doe',
        username: 'jane.doe',
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
    },
];

export const authApi = {
    login(dto: LoginDto): Promise<LoginResponse> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = users.find((u) => u.username === dto.username);
                if (!user) {
                    reject(new Error('User not found'));
                    return;
                }
                const tokens: AuthTokens = {
                    accessToken: 'access-token-1',
                    refreshToken: 'refresh-token-1',
                };
                resolve({ user, tokens });
            }, 1000);
        });
    },

    register(dto: RegisterDto): Promise<RegisterResponse> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = users.find((u) => u.username === dto.username);
                if (user) {
                    reject(new Error('User already exists'));
                    return;
                }
                const newUser: User = {
                    id: Date.now().toString(),
                    name: dto.name,
                    username: dto.username,
                    createdAt: Date.now().toString(),
                    updatedAt: Date.now().toString(),
                };
                users.push(newUser);
                const tokens: AuthTokens = {
                    accessToken: 'access-token-2',
                    refreshToken: 'refresh-token-2',
                };
                resolve({ user: newUser, tokens });
            }, 1000);
        });
    },

    refresh(dto: RefreshTokenDto): Promise<RefreshResponse> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (dto.refreshToken !== 'refresh-token-1') {
                    reject(new Error('Invalid refresh token'));
                    return;
                }
                const tokens: AuthTokens = {
                    accessToken: 'access-token-3',
                    refreshToken: 'refresh-token-3',
                };
                resolve({ tokens });
            }, 1000);
        });
    },

    logout(refreshToken: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (refreshToken !== 'refresh-token-1') {
                    reject(new Error('Invalid refresh token'));
                    return;
                }
                resolve();
            }, 1000);
        });
    },

    me(): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = users[0];
                if (!user) {
                    reject(new Error('User not found'));
                    return;
                }
                resolve(user);
            }, 1000);
        });
    },
};