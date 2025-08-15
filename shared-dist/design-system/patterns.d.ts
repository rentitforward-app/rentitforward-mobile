export interface SearchInputPattern {
    style: string;
    background: string;
    placeholder: string;
    button: {
        background: string;
        style: string;
    };
    width: {
        mobile: string;
        desktop: string;
    };
    borderRadius: string;
    padding: string;
}
export interface RatingPattern {
    display: string;
    starColor: string;
    textColor: string;
    fontSize: string;
    iconSize: string;
}
export interface PricingPattern {
    format: string;
    color: string;
    fontWeight: string;
    fontSize: string;
    position: string;
}
export interface StepsPattern {
    layout: string;
    numbering: {
        style: string;
        background: string;
        color: string;
        size: string;
    };
    connection: {
        style: string;
        color: string;
    };
    iconStyle: string;
}
export interface AnimationPattern {
    hover: {
        scale: string;
        shadow: string;
        duration: string;
    };
    transitions: {
        duration: string;
        timing: string;
    };
    loading: {
        type: string;
        color: string;
    };
    microInteractions: {
        buttons: string;
        forms: string;
    };
}
export declare const patterns: {
    searchInput: SearchInputPattern;
    ratings: RatingPattern;
    pricing: PricingPattern;
    steps: StepsPattern;
    animations: AnimationPattern;
};
export declare const generatePatternCSS: {
    searchInput: () => {
        borderRadius: string;
        backgroundColor: string;
        padding: string;
        width: string;
        border: string;
        '&:focus': {
            outline: string;
            borderColor: string;
            boxShadow: string;
        };
        '&::placeholder': {
            color: string;
        };
    };
    ratingStars: () => {
        display: string;
        alignItems: string;
        gap: string;
        fontSize: string;
        color: string;
        '.star': {
            color: string;
            fontSize: string;
        };
    };
    pricing: () => {
        color: string;
        fontWeight: string;
        fontSize: string;
        '.currency': {
            fontWeight: string;
            marginRight: string;
        };
    };
    stepIndicator: () => {
        display: string;
        alignItems: string;
        '.step-number': {
            width: string;
            height: string;
            borderRadius: string;
            backgroundColor: string;
            color: string;
            display: string;
            alignItems: string;
            justifyContent: string;
            fontWeight: string;
            fontSize: string;
        };
        '.step-connector': {
            width: string;
            height: string;
            backgroundColor: string;
            borderStyle: string;
            borderWidth: string;
            borderColor: string;
        };
    };
    hoverEffect: () => {
        transition: string;
        '&:hover': {
            transform: string;
            boxShadow: string;
        };
    };
};
export declare const touchTargets: {
    minimum: string;
    recommended: string;
    small: string;
    large: string;
};
export declare const animationDurations: {
    fast: string;
    normal: string;
    slow: string;
    loading: string;
};
export declare const easingFunctions: {
    easeOut: string;
    easeIn: string;
    easeInOut: string;
    bounce: string;
};
