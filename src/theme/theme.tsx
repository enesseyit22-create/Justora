import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useApp, useIsPro } from '@/src/store/store';
import { themes, type Palette } from '@/src/theme/themes';

type ThemeValue = { palette: Palette; scheme: 'light' | 'dark'; fontsReady: boolean };

const ThemeContext = createContext<ThemeValue>({
  palette: themes.justora.light,
  scheme: 'light',
  fontsReady: false,
});

export function ThemeBridge({ fontsReady, children }: { fontsReady: boolean; children: ReactNode }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const settings = useApp().settings;
  const pro = useIsPro();
  const themeId = !pro && settings.themeId !== 'justora' ? 'justora' : settings.themeId;
  const palette = themes[themeId][scheme];
  return <ThemeContext.Provider value={{ palette, scheme, fontsReady }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
