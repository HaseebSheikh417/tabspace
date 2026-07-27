import { useAuthStore } from '../store/auth.store';
import { AuthStatus } from '../types/auth.enums';

/**
 * useAuth — convenience hook exposing the most commonly needed auth values
 * and actions in a single, ergonomic interface.
 */
export function useAuth() {
    const status = useAuthStore((s) => s.status);
    const user = useAuthStore((s) => s.user);
    const accessToken = useAuthStore((s) => s.accessToken);
    const error = useAuthStore((s) => s.error);
    const isInitialized = useAuthStore((s) => s.isInitialized);

    const login = useAuthStore((s) => s.login);
    const register = useAuthStore((s) => s.register);
    const logout = useAuthStore((s) => s.logout);
    const initialize = useAuthStore((s) => s.initialize);
    const clearError = useAuthStore((s) => s.clearError);

    return {
        // derived booleans
        isAuthenticated: status === AuthStatus.AUTHENTICATED,
        isInitializing: status === AuthStatus.INITIALIZING,
        isInitialized,

        // data
        status,
        user,
        accessToken,
        error,

        // actions
        login,
        register,
        logout,
        initialize,
        clearError,
    };
}
