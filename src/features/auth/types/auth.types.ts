export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface User {
    id: string;

    username: string;

    name: string;

    avatar?: string;

    createdAt: string;

    updatedAt: string;
}