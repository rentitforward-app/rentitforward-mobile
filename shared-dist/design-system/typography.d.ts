export interface FontFamily {
    name: string;
    weights: number[];
    fallback: string[];
}
export interface TextStyle {
    fontSize: number;
    lineHeight: number;
    fontWeight: number;
    letterSpacing: number;
    fontFamily: string;
    color?: string;
    textDecoration?: string;
    responsive?: {
        mobile?: Partial<TextStyle>;
        tablet?: Partial<TextStyle>;
        desktop?: Partial<TextStyle>;
    };
}
export interface TypographyScale {
    hero: TextStyle;
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    body: TextStyle;
    bodySecondary: TextStyle;
    caption: TextStyle;
    link: TextStyle;
    displayLarge: TextStyle;
    displayMedium: TextStyle;
    displaySmall: TextStyle;
    headlineLarge: TextStyle;
    headlineMedium: TextStyle;
    headlineSmall: TextStyle;
    titleLarge: TextStyle;
    titleMedium: TextStyle;
    titleSmall: TextStyle;
    bodyLarge: TextStyle;
    bodyMedium: TextStyle;
    bodySmall: TextStyle;
    labelLarge: TextStyle;
    labelMedium: TextStyle;
    labelSmall: TextStyle;
}
export declare const fontFamilies: Record<string, FontFamily>;
export declare const typography: TypographyScale;
export declare const getTextStyle: (styleName: keyof TypographyScale) => TextStyle;
export declare const getFontFamily: (familyName: keyof typeof fontFamilies) => FontFamily;
export declare const generateTextStyleCSS: (style: TextStyle, breakpoint?: "mobile" | "tablet" | "desktop") => string;
export declare const generateTypographyVariables: () => Record<string, string>;
export declare const tailwindTypography: {
    fontFamily: {
        sans: string[];
    };
    fontSize: {
        hero: (string | {
            lineHeight: string;
            fontWeight: string;
        })[];
        h1: (string | {
            lineHeight: string;
            fontWeight: string;
        })[];
        h2: (string | {
            lineHeight: string;
            fontWeight: string;
        })[];
        h3: (string | {
            lineHeight: string;
            fontWeight: string;
        })[];
        body: (string | {
            lineHeight: string;
            fontWeight: string;
        })[];
        'body-secondary': (string | {
            lineHeight: string;
            fontWeight: string;
        })[];
        caption: (string | {
            lineHeight: string;
            fontWeight: string;
        })[];
        link: (string | {
            lineHeight: string;
            fontWeight: string;
        })[];
    };
    fontWeight: {
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
    };
};
