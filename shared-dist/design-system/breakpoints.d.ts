export interface BreakpointConfig {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
}
export interface MediaQueries {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
    mobileOnly: string;
    tabletOnly: string;
    desktopUp: string;
    tabletUp: string;
}
export declare const breakpoints: BreakpointConfig;
export declare const mediaQueries: MediaQueries;
export declare const getBreakpoint: (name: keyof BreakpointConfig) => number;
export declare const getMediaQuery: (name: keyof MediaQueries) => string;
export declare const isBreakpoint: (breakpointName: keyof BreakpointConfig, currentWidth: number) => boolean;
export declare const getCurrentBreakpoint: (width: number) => keyof BreakpointConfig;
export declare const generateBreakpointVariables: () => Record<string, string>;
export declare const tailwindBreakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
};
export declare const containerSizes: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
};
export declare const gridConfig: {
    columns: number;
    gutter: number;
    margins: {
        mobile: number;
        tablet: number;
        desktop: number;
    };
    collapsePatterns: {
        categories: {
            desktop: number;
            tablet: number;
            mobile: number;
        };
        features: {
            desktop: number;
            tablet: number;
            mobile: number;
        };
        products: {
            desktop: number;
            tablet: number;
            mobile: number;
        };
    };
};
