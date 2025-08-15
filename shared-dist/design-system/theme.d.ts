import { ColorPalette } from './colors';
import { TypographyScale } from './typography';
import { SpacingScale } from './spacing';
import { BreakpointConfig } from './breakpoints';
import { ComponentTheme } from './components';
export interface Theme {
    name: string;
    mode: 'light' | 'dark';
    colors: ColorPalette;
    typography: TypographyScale;
    spacing: SpacingScale;
    breakpoints: BreakpointConfig;
    components: ComponentTheme;
}
export interface ThemeConfig {
    defaultTheme: 'light' | 'dark';
    enableSystemTheme: boolean;
    customColors?: Partial<ColorPalette>;
    customTypography?: Partial<TypographyScale>;
    customSpacing?: Partial<SpacingScale>;
}
export declare const lightTheme: Theme;
export declare const darkTheme: Theme;
export declare const getTheme: (mode?: "light" | "dark") => Theme;
export declare const getCurrentTheme: (isDark: boolean) => Theme;
export declare const createTheme: (config: ThemeConfig) => {
    light: Theme;
    dark: Theme;
};
export interface ThemeContextValue {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (mode: 'light' | 'dark') => void;
}
export declare const useTheme: () => ThemeContextValue;
