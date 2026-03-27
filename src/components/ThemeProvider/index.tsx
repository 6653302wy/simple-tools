'use client';

import {
    createContext,
    type FC,
    type PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { StorageEnum } from '@/services/types';

const STORAGE_KEY = StorageEnum.Theme;
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

type Theme = 'light' | 'dark';
const DEFAULT_THEME: Theme = 'dark';

type ThemeContextValue = {
    theme: Theme;
    setTheme: (nextTheme: Theme) => void;
    toggleTheme: () => void;
    mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

const readStoredTheme = (): Theme | null => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : null;
};

const readDocumentTheme = (): Theme | null => {
    if (typeof document === 'undefined') return null;
    const preset = document.documentElement.dataset.theme;
    return isTheme(preset) ? preset : null;
};

const persistTheme = (theme: Theme) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, theme);
};

const applyTheme = (theme: Theme) => {
    if (typeof document === 'undefined') return;
    // const root = document.documentElement;
    // const isDark = theme === 'dark';
    // root.classList.toggle('dark', isDark);
    // root.dataset.theme = theme;
    // root.style.setProperty('color-scheme', theme);

    persistTheme(theme);
};

/**
 * 主题设置和切换
 */
export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof document === 'undefined') {
            return DEFAULT_THEME;
        }
        const preset = readDocumentTheme();
        if (preset) {
            return preset;
        }
        const stored = readStoredTheme();
        if (stored) {
            return stored;
        }
        return DEFAULT_THEME;
    });
    const [mounted, setMounted] = useState(false);
    const initialThemeRef = useRef(theme);

    useLayoutEffect(() => {
        const current = readDocumentTheme();
        if (current && current !== initialThemeRef.current) {
            setThemeState(current);
        }
        setMounted(true);
    }, []);

    const setTheme = useCallback((nextTheme: Theme) => {
        setThemeState(nextTheme);
    }, []);

    useEffect(() => {
        if (mounted) {
            applyTheme(theme);
        }
    }, [theme, mounted]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
        const media = window.matchMedia(COLOR_SCHEME_QUERY);

        const handleChange = (event: MediaQueryListEvent) => {
            if (readStoredTheme()) return;

            const nextTheme: Theme = event.matches ? 'dark' : 'light';
            setThemeState(nextTheme);
        };

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme: () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
                mounted,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * 主题设置和切换hook
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
