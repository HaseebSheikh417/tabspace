/**
 * AuthService is responsible for persisting and retrieving auth tokens.
 *
 * Storage strategy:
 *  - Chrome extension context  → chrome.storage.local (persists across sessions)
 *  - Dev / web context         → localStorage (fallback)
 */

const KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChromeStorageArea = { get: any; set: any; remove: any };

function getChromeStorage(): ChromeStorageArea | null {
    if (
        typeof globalThis !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (globalThis as any).chrome !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (globalThis as any).chrome.storage !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (globalThis as any).chrome.storage.local !== 'undefined'
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (globalThis as any).chrome.storage.local as ChromeStorageArea;
    }
    return null;
}

async function chromeGet(key: string): Promise<string | null> {
    const storage = getChromeStorage()!;
    return new Promise((resolve) => {
        storage.get([key], (result: Record<string, unknown>) => {
            resolve((result[key] as string | undefined) ?? null);
        });
    });
}

async function chromeSet(key: string, value: string): Promise<void> {
    const storage = getChromeStorage()!;
    return new Promise((resolve) => {
        storage.set({ [key]: value }, resolve);
    });
}

async function chromeRemove(keys: string[]): Promise<void> {
    const storage = getChromeStorage()!;
    return new Promise((resolve) => {
        storage.remove(keys, resolve);
    });
}

export const authTokenService = {
    async getAccessToken(): Promise<string | null> {
        if (getChromeStorage()) {
            return chromeGet(KEYS.ACCESS_TOKEN);
        }
        return localStorage.getItem(KEYS.ACCESS_TOKEN);
    },

    async getRefreshToken(): Promise<string | null> {
        if (getChromeStorage()) {
            return chromeGet(KEYS.REFRESH_TOKEN);
        }
        return localStorage.getItem(KEYS.REFRESH_TOKEN);
    },

    async setTokens(accessToken: string, refreshToken: string): Promise<void> {
        if (getChromeStorage()) {
            await chromeSet(KEYS.ACCESS_TOKEN, accessToken);
            await chromeSet(KEYS.REFRESH_TOKEN, refreshToken);
        } else {
            localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
        }
    },

    async clearTokens(): Promise<void> {
        if (getChromeStorage()) {
            await chromeRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN]);
        } else {
            localStorage.removeItem(KEYS.ACCESS_TOKEN);
            localStorage.removeItem(KEYS.REFRESH_TOKEN);
        }
    },
};
