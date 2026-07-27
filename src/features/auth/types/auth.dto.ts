export interface LoginDto {
    username: string;

    password: string;
}

export interface RegisterDto {
    username: string;

    password: string;

    name: string;
}

export interface RefreshTokenDto {
    refreshToken: string;
}