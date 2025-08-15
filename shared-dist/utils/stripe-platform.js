"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerEnvironmentRequiredError = exports.StripeNotAvailableError = exports.formatAmountFromStripe = exports.formatAmountForStripe = exports.calculateTotalWithFees = exports.calculatePlatformFee = exports.createPaymentIntent = exports.createAccountLink = exports.createConnectedAccount = void 0;
exports.isStripeAvailable = isStripeAvailable;
exports.requireServerEnvironment = requireServerEnvironment;
// Platform-aware Stripe utilities
const platform_1 = require("./platform");
// Conditionally import and initialize Stripe only in server environments
let stripe = null;
// Only initialize Stripe in server environments (Node.js)
if ((0, platform_1.isNode)() && !(0, platform_1.isReactNative)()) {
    try {
        // Dynamic require to avoid bundling in React Native
        const StripeModule = require('stripe');
        const StripeClass = StripeModule.default || StripeModule;
        if (StripeClass && process.env.STRIPE_SECRET_KEY) {
            stripe = new StripeClass(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2023-10-16',
            });
        }
    }
    catch (error) {
        console.warn('Stripe module not available in this environment:', error);
    }
}
// Helper function to ensure Stripe is available
function requireStripe() {
    if (!stripe) {
        throw new Error('Stripe is not available in this environment. Use this function only on the server.');
    }
    return stripe;
}
// ==================== PLATFORM DETECTION ====================
function isStripeAvailable() {
    return stripe !== null;
}
function requireServerEnvironment() {
    if ((0, platform_1.isReactNative)()) {
        throw new Error('This function is not available in React Native. Use platform-specific Stripe SDK.');
    }
    if (!(0, platform_1.isNode)()) {
        throw new Error('This function requires a server environment.');
    }
}
// ==================== SAFE STRIPE OPERATIONS ====================
// These functions can be called from any environment but will throw appropriate errors
const createConnectedAccount = async (email, country = 'AU') => {
    requireServerEnvironment();
    const stripeInstance = requireStripe();
    const account = await stripeInstance.accounts.create({
        type: 'express',
        email,
        country,
        capabilities: {
            transfers: { requested: true },
            card_payments: { requested: true },
        },
        business_profile: {
            product_description: 'Peer-to-peer rental marketplace',
        },
        metadata: {
            platform: 'rent-it-forward',
        },
    });
    return account.id;
};
exports.createConnectedAccount = createConnectedAccount;
const createAccountLink = async (accountId, refreshUrl, returnUrl) => {
    requireServerEnvironment();
    const stripeInstance = requireStripe();
    const link = await stripeInstance.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
        collection_options: {
            fields: 'currently_due',
            future_requirements: 'include',
        },
    });
    return link.url;
};
exports.createAccountLink = createAccountLink;
const createPaymentIntent = async ({ amount, currency = 'aud', applicationFeeAmount, connectedAccountId, customerId, metadata = {}, description, }) => {
    requireServerEnvironment();
    const stripeInstance = requireStripe();
    const intent = await stripeInstance.paymentIntents.create({
        amount,
        currency,
        application_fee_amount: applicationFeeAmount,
        customer: customerId,
        description,
        metadata: {
            platform: 'rent-it-forward',
            ...metadata,
        },
        transfer_data: {
            destination: connectedAccountId,
        },
        automatic_payment_methods: {
            enabled: true,
        },
    });
    return {
        client_secret: intent.client_secret,
        payment_intent_id: intent.id,
    };
};
exports.createPaymentIntent = createPaymentIntent;
// ==================== PRICING & FEES (Pure Functions) ====================
// These are pure functions that don't require Stripe and work everywhere
const calculatePlatformFee = (amount, feePercentage = 5) => {
    return Math.round(amount * (feePercentage / 100));
};
exports.calculatePlatformFee = calculatePlatformFee;
const calculateTotalWithFees = (baseAmount, feePercentage = 5) => {
    const platformFee = (0, exports.calculatePlatformFee)(baseAmount, feePercentage);
    return {
        base_amount: baseAmount,
        platform_fee: platformFee,
        total_amount: baseAmount + platformFee,
    };
};
exports.calculateTotalWithFees = calculateTotalWithFees;
const formatAmountForStripe = (amount) => {
    // Convert dollars to cents
    return Math.round(amount * 100);
};
exports.formatAmountForStripe = formatAmountForStripe;
const formatAmountFromStripe = (amount) => {
    // Convert cents to dollars
    return amount / 100;
};
exports.formatAmountFromStripe = formatAmountFromStripe;
// ==================== ERROR TYPES ====================
class StripeNotAvailableError extends Error {
    constructor(message = 'Stripe is not available in this environment') {
        super(message);
        this.name = 'StripeNotAvailableError';
    }
}
exports.StripeNotAvailableError = StripeNotAvailableError;
class ServerEnvironmentRequiredError extends Error {
    constructor(message = 'This operation requires a server environment') {
        super(message);
        this.name = 'ServerEnvironmentRequiredError';
    }
}
exports.ServerEnvironmentRequiredError = ServerEnvironmentRequiredError;
