import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { createAppTheme } from './theme';
import '@fontsource/plus-jakarta-sans/300.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';

type ThemeMode = 'light' | 'dark';
type Direction = 'ltr' | 'rtl';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  direction: Direction;
  setDirection: (dir: Direction) => void;
  toggleDirection: () => void;
  isRTL: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleMode: () => {},
  direction: 'ltr',
  setDirection: () => {},
  toggleDirection: () => {},
  isRTL: false,
});

export const useThemeContext = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = 'smartpos-theme';
const DIRECTION_STORAGE_KEY = 'smartpos-direction';

function getStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    //
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredDirection(): Direction {
  try {
    const stored = localStorage.getItem(DIRECTION_STORAGE_KEY);
    if (stored === 'ltr' || stored === 'rtl') return stored;
  } catch {
    //
  }
  return 'ltr';
}

function createEmotionCache(dir: Direction) {
  let key = 'mui';
  const stylisPlugins = dir === 'rtl' ? [prefixer, rtlPlugin] as any : [prefixer] as any;

  return createCache({
    key,
    prepend: true,
    stylisPlugins,
  });
}

interface ThemeContextProviderProps {
  children: React.ReactNode;
}

export function ThemeContextProvider({ children }: ThemeContextProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);
  const [direction, setDirectionState] = useState<Direction>(getStoredDirection);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setDirection = useCallback((dir: Direction) => {
    setDirectionState(dir);
    localStorage.setItem(DIRECTION_STORAGE_KEY, dir);
    document.documentElement.dir = dir;
    document.documentElement.lang = dir === 'rtl' ? 'ar' : 'en';
  }, []);

  const toggleDirection = useCallback(() => {
    setDirectionState((prev) => {
      const next = prev === 'ltr' ? 'rtl' : 'ltr';
      localStorage.setItem(DIRECTION_STORAGE_KEY, next);
      document.documentElement.dir = next;
      document.documentElement.lang = next === 'rtl' ? 'ar' : 'en';
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = direction === 'rtl' ? 'ar' : 'en';
  }, [direction]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setMode(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const emotionCache = useMemo(() => createEmotionCache(direction), [direction]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleMode,
      direction,
      setDirection,
      toggleDirection,
      isRTL: direction === 'rtl',
    }),
    [mode, toggleMode, direction, setDirection, toggleDirection],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <CacheProvider value={emotionCache}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
}