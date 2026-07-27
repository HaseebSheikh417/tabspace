import axios, {
    AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from 'axios';
import { ApiConfig } from './api.config';
import type { ApiError } from './api.types';

class HttpClient {
    private readonly client: AxiosInstance;
    /** Tracks pending refresh to avoid concurrent calls */
    private isRefreshing = false;
    /** Queue of requests waiting for the new token */
    private refreshQueue: Array<{
        resolve: (token: string) => void;
        reject: (error: unknown) => void;
    }> = [];

    constructor() {
        this.client = axios.create({
            baseURL: ApiConfig.baseURL,
            timeout: ApiConfig.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupResponseInterceptor();
    }

    public get instance(): AxiosInstance {
        return this.client;
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    public static toApiError(error: unknown): ApiError {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            return {
                status: axiosError.response?.status ?? 500,
                message:
                    (axiosError.response?.data as { message?: string })?.message ??
                    axiosError.message ??
                    'Unexpected error',
                data: axiosError.response?.data,
            };
        }
        return { status: 500, message: 'Unexpected error' };
    }

    // ─────────────────────────────────────────────────────────────────────
    // 401 → silent refresh → retry original request
    // ─────────────────────────────────────────────────────────────────────
    private setupResponseInterceptor() {
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & {
                    _retry?: boolean;
                };

                const isUnauthorized = error.response?.status === 401;
                // Prevent infinite loop on the refresh endpoint itself
                const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

                if (isUnauthorized && !originalRequest._retry && !isRefreshEndpoint) {
                    originalRequest._retry = true;

                    if (this.isRefreshing) {
                        // Queue this request until the refresh completes
                        return new Promise((resolve, reject) => {
                            this.refreshQueue.push({ resolve, reject });
                        }).then((token) => {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            return this.client(originalRequest);
                        });
                    }

                    this.isRefreshing = true;

                    try {
                        // Lazily import to avoid circular dependency at module load time
                        const { useAuthStore } = await import('../../features/auth/store/auth.store');
                        const refreshed = await useAuthStore.getState().refresh();

                        if (refreshed) {
                            const newToken = useAuthStore.getState().accessToken!;
                            this.resolveQueue(newToken);
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                            return this.client(originalRequest);
                        } else {
                            // Refresh failed → force logout
                            this.rejectQueue(new Error('Session expired'));
                            await useAuthStore.getState().logout();
                        }
                    } catch (refreshError) {
                        this.rejectQueue(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            },
        );
    }

    private resolveQueue(token: string) {
        this.refreshQueue.forEach(({ resolve }) => resolve(token));
        this.refreshQueue = [];
    }

    private rejectQueue(error: unknown) {
        this.refreshQueue.forEach(({ reject }) => reject(error));
        this.refreshQueue = [];
    }
}

export const httpClient = new HttpClient();