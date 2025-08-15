export interface SpacingScale {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
    '6xl': number;
    none: number;
    auto: string;
    buttonPadding: {
        sm: {
            x: number;
            y: number;
        };
        md: {
            x: number;
            y: number;
        };
        lg: {
            x: number;
            y: number;
        };
    };
    cardPadding: {
        sm: number;
        md: number;
        lg: number;
    };
    sectionPadding: {
        sm: number;
        md: number;
        lg: number;
    };
}
export declare const spacing: SpacingScale;
export declare const getSpacing: (size: keyof Omit<SpacingScale, "buttonPadding" | "cardPadding" | "sectionPadding">) => number | string;
export declare const getButtonPadding: (size: "sm" | "md" | "lg") => {
    x: number;
    y: number;
} | {
    x: number;
    y: number;
} | {
    x: number;
    y: number;
};
export declare const getCardPadding: (size: "sm" | "md" | "lg") => number;
export declare const getSectionPadding: (size: "sm" | "md" | "lg") => number;
export declare const generateSpacingVariables: () => Record<string, string>;
export declare const tailwindSpacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    '0': string;
    '0.5': string;
    '1': string;
    '1.5': string;
    '2': string;
    '2.5': string;
    '3': string;
    '3.5': string;
    '4': string;
    '5': string;
    '6': string;
    '7': string;
    '8': string;
    '9': string;
    '10': string;
    '11': string;
    '12': string;
    '14': string;
    '16': string;
    '20': string;
    '24': string;
    '28': string;
    '32': string;
    '36': string;
    '40': string;
    '44': string;
    '48': string;
    '52': string;
    '56': string;
    '60': string;
    '64': string;
    '72': string;
    '80': string;
    '96': string;
};
export declare const borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
};
export declare const shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
};
export declare const layoutSpacing: {
    containerMaxWidth: string;
    sectionPadding: {
        top: number;
        bottom: number;
        sides: number;
    };
    heroPadding: {
        top: number;
        bottom: number;
        sides: number;
    };
};
