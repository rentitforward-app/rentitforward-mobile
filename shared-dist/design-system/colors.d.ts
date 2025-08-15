export interface ColorPalette {
    primary: {
        main: string;
    };
    secondary: {
        light: string;
        medium: string;
    };
    neutral: {
        white: string;
        lightGray: string;
        mediumGray: string;
        darkGray: string;
        charcoal: string;
        logoGray: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        brand: string;
    };
    accent: {
        yellow: string;
    };
    success: string;
    warning: string;
    error: string;
    info: string;
    white: string;
    black: string;
    gray50: string;
    gray100: string;
    gray200: string;
    gray300: string;
    gray400: string;
    gray500: string;
    gray600: string;
    gray700: string;
    gray800: string;
    gray900: string;
}
export declare const lightColors: ColorPalette;
export declare const darkColors: ColorPalette;
export declare const getColorValue: (colorPath: string, isDark?: boolean) => string;
export declare const generateCSSVariables: (colors: ColorPalette) => Record<string, string>;
export declare const tailwindColors: {
    primary: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    secondary: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    neutral: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        brand: string;
    };
};
export declare const colors: {
    primary: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    secondary: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    neutral: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        brand: string;
    };
    accent: {
        yellow: string;
    };
};
