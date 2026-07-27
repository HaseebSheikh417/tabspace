import type { AxiosRequestConfig } from 'axios';

export interface ApiRequestConfig extends AxiosRequestConfig { }

export interface ApiError {
    status: number;
    message: string;
    data?: unknown;
}