export declare function isStripeAvailable(): boolean;
export declare function requireServerEnvironment(): void;
export declare const createConnectedAccount: (email: string, country?: string) => Promise<string>;
export declare const createAccountLink: (accountId: string, refreshUrl: string, returnUrl: string) => Promise<string>;
export declare const createPaymentIntent: ({ amount, currency, applicationFeeAmount, connectedAccountId, customerId, metadata, description, }: {
    amount: number;
    currency?: string;
    applicationFeeAmount: number;
    connectedAccountId: string;
    customerId?: string;
    metadata?: Record<string, string>;
    description?: string;
}) => Promise<{
    client_secret: string | null;
    payment_intent_id: string;
}>;
export declare const calculatePlatformFee: (amount: number, feePercentage?: number) => number;
export declare const calculateTotalWithFees: (baseAmount: number, feePercentage?: number) => {
    base_amount: number;
    platform_fee: number;
    total_amount: number;
};
export declare const formatAmountForStripe: (amount: number) => number;
export declare const formatAmountFromStripe: (amount: number) => number;
export interface PaymentIntentResult {
    client_secret: string | null;
    payment_intent_id: string;
}
export interface PlatformFeeCalculation {
    base_amount: number;
    platform_fee: number;
    total_amount: number;
}
export declare class StripeNotAvailableError extends Error {
    constructor(message?: string);
}
export declare class ServerEnvironmentRequiredError extends Error {
    constructor(message?: string);
}
