export interface GridConfig {
    columns: number;
    gutter: string;
    breakpoints: {
        mobile: string;
        tablet: string;
        desktop: string;
        wide: string;
    };
}
export interface SectionLayout {
    background: string;
    textColor?: string;
    textAlign?: string;
    padding: string;
    structure: string[];
}
export interface SectionLayouts {
    hero: SectionLayout;
    categories: SectionLayout;
    features: SectionLayout;
    products: SectionLayout;
}
export declare const grid: GridConfig;
export declare const sections: SectionLayouts;
export declare const gridPatterns: {
    categories: {
        desktop: {
            columns: number;
            itemsPerRow: number;
            gap: string;
        };
        tablet: {
            columns: number;
            itemsPerRow: number;
            gap: string;
        };
        mobile: {
            columns: number;
            itemsPerRow: number;
            gap: string;
        };
    };
    features: {
        desktop: {
            columns: number;
            itemsPerRow: number;
            gap: string;
        };
        tablet: {
            columns: number;
            itemsPerRow: number;
            gap: string;
        };
        mobile: {
            columns: number;
            itemsPerRow: number;
            gap: string;
        };
    };
    products: {
        desktop: {
            columns: number;
            itemsPerRow: number;
            gap: string;
        };
        tablet: {
            columns: number;
            itemsPerRow: number;
            gap: string;
        };
        mobile: {
            columns: number;
            itemsPerRow: number;
            gap: string;
        };
    };
};
export declare const containers: {
    main: {
        maxWidth: string;
        margin: string;
        padding: {
            mobile: string;
            tablet: string;
            desktop: string;
        };
    };
    hero: {
        maxWidth: string;
        margin: string;
        padding: {
            mobile: string;
            tablet: string;
            desktop: string;
        };
    };
    section: {
        maxWidth: string;
        margin: string;
        padding: {
            mobile: string;
            tablet: string;
            desktop: string;
        };
    };
};
export declare const cssGrid: {
    categories: (breakpoint: "mobile" | "tablet" | "desktop") => {
        display: string;
        gridTemplateColumns: string;
        gap: string;
        width: string;
    };
    features: (breakpoint: "mobile" | "tablet" | "desktop") => {
        display: string;
        gridTemplateColumns: string;
        gap: string;
        width: string;
    };
    products: (breakpoint: "mobile" | "tablet" | "desktop") => {
        display: string;
        gridTemplateColumns: string;
        gap: string;
        width: string;
    };
};
export declare const flexbox: {
    center: {
        display: string;
        alignItems: string;
        justifyContent: string;
    };
    spaceBetween: {
        display: string;
        justifyContent: string;
        alignItems: string;
    };
    column: {
        display: string;
        flexDirection: string;
    };
    rowGap: (gap: string) => {
        display: string;
        flexDirection: string;
        gap: string;
        alignItems: string;
    };
    columnGap: (gap: string) => {
        display: string;
        flexDirection: string;
        gap: string;
    };
};
export declare const responsive: {
    hideMobile: {
        '@media (max-width: 767px)': {
            display: string;
        };
    };
    hideDesktop: {
        '@media (min-width: 1024px)': {
            display: string;
        };
    };
    mobileOnly: {
        '@media (min-width: 768px)': {
            display: string;
        };
    };
    desktopOnly: {
        '@media (max-width: 1023px)': {
            display: string;
        };
    };
};
export declare const aspectRatios: {
    hero: string;
    product: string;
    square: string;
    feature: string;
    banner: string;
};
export declare const zIndex: {
    background: number;
    default: number;
    content: number;
    header: number;
    overlay: number;
    modal: number;
    toast: number;
    tooltip: number;
};
