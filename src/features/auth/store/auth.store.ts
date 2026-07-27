import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import { authTokenService } from '../services/auth.service';
import { AuthStatus } from '../types/auth.enums';
import type { LoginDto, RegisterDto } from '../types/auth.dto';
import type { User } from '../types/auth.types';
import { httpClient } from '../../../shared/api';

interface AuthState {
    // ── State ────────────────────────────────────────────────────────────
    status: AuthStatus;
    user: User | null;
    accessToken: string | null;
    error: string | null;
    isInitialized: boolean;

    // ── Actions ──────────────────────────────────────────────────────────
    initialize: () => Promise<void>;
    login: (dto: LoginDto) => Promise<void>;
    register: (dto: RegisterDto) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<boolean>;
    clearError: () => void;
}

/** Attach the bearer token to every outgoing request */
function attachAuthInterceptor(accessToken: string) {
    httpClient.instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}

function detachAuthInterceptor() {
    delete httpClient.instance.defaults.headers.common['Authorization'];
}

export const useAuthStore = create<AuthState>((set, get) => ({
    status: AuthStatus.INITIALIZING,
    user: null,
    accessToken: null,
    error: null,
    isInitialized: false,

    // ─────────────────────────────────────────────────────────────────────
    // initialize — called once on app boot; tries to restore session from
    // stored tokens via /auth/me so the user doesn't have to log in again.
    // ─────────────────────────────────────────────────────────────────────
    initialize: async () => {
        const storedAccess = await authTokenService.getAccessToken();

        if (!storedAccess) {
            set({ status: AuthStatus.UNAUTHENTICATED, isInitialized: true });
            return;
        }

        try {
            attachAuthInterceptor(storedAccess);
            const user = await authApi.me();
            set({
                status: AuthStatus.AUTHENTICATED,
                user,
                accessToken: storedAccess,
                isInitialized: true,
            });
        } catch {
            // Access token is expired — try a silent refresh
            const refreshed = await get().refresh();
            if (!refreshed) {
                await authTokenService.clearTokens();
                detachAuthInterceptor();
                set({ status: AuthStatus.UNAUTHENTICATED, isInitialized: true });
            }
        }
    },

    // ─────────────────────────────────────────────────────────────────────
    // login
    // ─────────────────────────────────────────────────────────────────────
    login: async (dto: LoginDto) => {
        set({ error: null });
        try {
            const { user, tokens } = await authApi.login(dto);
            await authTokenService.setTokens(tokens.accessToken, tokens.refreshToken);
            attachAuthInterceptor(tokens.accessToken);
            set({
                status: AuthStatus.AUTHENTICATED,
                user,
                accessToken: tokens.accessToken,
                error: null,
            });
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Login failed. Please try again.';
            set({ error: message });
            throw err; // bubble up so the UI can react if needed
        }
    },

    // ─────────────────────────────────────────────────────────────────────
    // register
    // ─────────────────────────────────────────────────────────────────────
    register: async (dto: RegisterDto) => {
        set({ error: null });
        try {
            const { user, tokens } = await authApi.register(dto);
            await authTokenService.setTokens(tokens.accessToken, tokens.refreshToken);
            attachAuthInterceptor(tokens.accessToken);
            set({
                status: AuthStatus.AUTHENTICATED,
                user,
                accessToken: tokens.accessToken,
                error: null,
            });
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Registration failed. Please try again.';
            set({ error: message });
            throw err;
        }
    },

    // ─────────────────────────────────────────────────────────────────────
    // logout
    // ─────────────────────────────────────────────────────────────────────
    logout: async () => {
        const refreshToken = await authTokenService.getRefreshToken();
        if (refreshToken) {
            try {
                await authApi.logout(refreshToken);
            } catch {
                // Ignore — we clear locally regardless
            }
        }
        await authTokenService.clearTokens();
        detachAuthInterceptor();
        set({
            status: AuthStatus.UNAUTHENTICATED,
            user: null,
            accessToken: null,
            error: null,
        });
    },

    // ─────────────────────────────────────────────────────────────────────
    // refresh — silently exchange a refresh token for a new access token
    // Returns true on success, false on failure.
    // ─────────────────────────────────────────────────────────────────────
    refresh: async () => {
        const refreshToken = await authTokenService.getRefreshToken();
        if (!refreshToken) return false;

        try {
            const { tokens } = await authApi.refresh({ refreshToken });
            await authTokenService.setTokens(tokens.accessToken, tokens.refreshToken);
            attachAuthInterceptor(tokens.accessToken);

            // Re-fetch the user profile with the new token
            const user = await authApi.me();
            set({
                status: AuthStatus.AUTHENTICATED,
                user,
                accessToken: tokens.accessToken,
                isInitialized: true,
            });
            return true;
        } catch {
            return false;
        }
    },

    clearError: () => set({ error: null }),
}));