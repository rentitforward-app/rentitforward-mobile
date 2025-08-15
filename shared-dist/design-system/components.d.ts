import { ColorPalette } from './colors';
import { TextStyle } from './typography';
export interface ComponentVariant {
    default: ComponentStyle;
    hover?: ComponentStyle;
    active?: ComponentStyle;
    disabled?: ComponentStyle;
    focus?: ComponentStyle;
}
export interface ComponentStyle {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: {
        x: number;
        y: number;
    };
    textStyle?: Partial<TextStyle>;
    shadow?: string;
    opacity?: number;
}
export interface ButtonVariants {
    primary: ComponentVariant;
    secondary: ComponentVariant;
    text: ComponentVariant;
    outline: ComponentVariant;
}
export interface CardVariants {
    product: ComponentVariant;
    feature: ComponentVariant;
    default: ComponentVariant;
    elevated: ComponentVariant;
    outlined: ComponentVariant;
}
export interface InputVariants {
    default: ComponentVariant;
    filled: ComponentVariant;
    outlined: ComponentVariant;
}
export interface ComponentTheme {
    buttons: ButtonVariants;
    cards: CardVariants;
    inputs: InputVariants;
    navigation: {
        header: ComponentStyle;
    };
    icons: {
        size: number;
        color: string;
        style: string;
    };
    loadingIndicator: {
        color: string;
        size: number;
        strokeWidth?: number;
    };
}
export declare const createButtonStyles: (colors: ColorPalette) => ButtonVariants;
export declare const createCardStyles: (colors: ColorPalette) => CardVariants;
export declare const createInputStyles: (colors: ColorPalette) => InputVariants;
export declare const createComponentTheme: (colors: ColorPalette) => ComponentTheme;
export declare const getComponentStyle: (component: ComponentVariant, state?: keyof ComponentVariant) => ComponentStyle;
export declare const generateComponentCSS: (style: ComponentStyle) => string;
