import { lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { breakpoints } from './breakpoints';
export interface DesignTokens {
    colors: {
        light: typeof lightColors;
        dark: typeof darkColors;
    };
    typography: typeof typography;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    shadows: typeof shadows;
    breakpoints: typeof breakpoints;
    animation: {
        duration: {
            fast: number;
            normal: number;
            slow: number;
        };
        easing: {
            easeIn: string;
            easeOut: string;
            easeInOut: string;
        };
    };
    zIndex: {
        dropdown: number;
        modal: number;
        tooltip: number;
        overlay: number;
        max: number;
    };
}
export declare const designTokens: DesignTokens;
export declare const getToken: (path: string, mode?: "light" | "dark") => any;
export declare const generateTokenVariables: (mode?: "light" | "dark") => Record<string, string>;
export declare const webTokens: {
    css: Record<string, string>;
    cssDark: Record<string, string>;
    tailwind: {
        colors: {
            primary: {
                main: string;
            };
            secondary: {
                light: string;
                medium: string;
            };
            success: string;
            warning: string;
            error: string;
            info: string;
        };
        fontFamily: {
            sora: string[];
            manrope: string[];
        };
        spacing: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
    };
};
export declare const mobileTokens: {
    colors: import("./colors").ColorPalette;
    colorsDark: import("./colors").ColorPalette;
    typography: {
        [k: string]: {
            fontSize: any;
            lineHeight: number;
            fontWeight: any;
            letterSpacing: any;
            fontFamily: any;
        };
    };
    spacing: {
        [k: string]: number;
    };
    borderRadius: {
        [k: string]: number;
    };
};
export { lightColors, darkColors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, shadows } from './spacing';
export { breakpoints } from './breakpoints';
