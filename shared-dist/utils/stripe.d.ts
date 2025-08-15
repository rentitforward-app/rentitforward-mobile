declare let stripe: import('stripe').default | null;
export declare const createConnectedAccount: (email: string, country?: string) => Promise<string>;
export declare const createAccountLink: (accountId: string, refreshUrl: string, returnUrl: string) => Promise<string>;
export declare const getAccountStatus: (accountId: string) => Promise<{
    id: string;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
    pending_verification: string[];
    disabled_reason: string | null | undefined;
    verification_status: {
        identity: string;
        document: string;
    };
    business_type: import("stripe").Stripe.Account.BusinessType | null | undefined;
    country: string | undefined;
}>;
export declare const createLoginLink: (accountId: string) => Promise<string>;
export declare const createCustomer: ({ email, name, phone, metadata, }: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
}) => Promise<string>;
export declare const getCustomer: (customerId: string) => Promise<import("stripe").Stripe.Response<import("stripe").Stripe.Customer | import("stripe").Stripe.DeletedCustomer>>;
export declare const updateCustomer: (customerId: string, updates: Stripe.CustomerUpdateParams) => Promise<import("stripe").Stripe.Response<import("stripe").Stripe.Customer>>;
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
export declare const confirmPaymentIntent: (paymentIntentId: string) => Promise<import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent>>;
export declare const getPaymentIntent: (paymentIntentId: string) => Promise<import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent>>;
export declare const createEscrowPayment: ({ amount, depositAmount, currency, applicationFeeAmount, connectedAccountId, customerId, bookingId, listingTitle, }: {
    amount: number;
    depositAmount: number;
    currency?: string;
    applicationFeeAmount: number;
    connectedAccountId: string;
    customerId: string;
    bookingId: string;
    listingTitle: string;
}) => Promise<{
    client_secret: string | null;
    payment_intent_id: string;
}>;
export declare const releaseEscrowPayment: (paymentIntentId: string, amountToRelease: number) => Promise<string>;
export declare const refundDeposit: (paymentIntentId: string, depositAmount: number, reason?: string) => Promise<string>;
export declare const uploadVerificationDocument: (accountId: string, documentType: "identity_document" | "address_document", frontImageData: string, backImageData?: string) => Promise<{
    front_file_id: string;
    back_file_id: string | undefined;
}>;
export declare const getVerificationStatus: (accountId: string) => Promise<{
    overall_status: string;
    identity_verification: {
        status: string;
        details: string | null;
    };
    document_verification: {
        front_uploaded: boolean;
        back_uploaded: boolean;
        status: string;
    };
    requirements: {
        currently_due: string[];
        eventually_due: string[];
        past_due: string[];
        pending_verification: string[];
    };
    capabilities: {
        charges_enabled: boolean;
        payouts_enabled: boolean;
    };
    disabled_reason: string | null | undefined;
}>;
export declare const constructWebhookEvent: (payload: string | Buffer, signature: string) => import("stripe").Stripe.Event;
export declare const calculatePlatformFee: (amount: number, feePercentage?: number) => number;
export declare const calculateTotalWithFees: (baseAmount: number, feePercentage?: number) => {
    base_amount: number;
    platform_fee: number;
    total_amount: number;
};
export declare const formatAmountForStripe: (amount: number) => number;
export declare const formatAmountFromStripe: (amount: number) => number;
export declare const isTestMode: () => boolean;
export { stripe };
