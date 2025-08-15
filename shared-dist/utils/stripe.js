"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = exports.isTestMode = exports.formatAmountFromStripe = exports.formatAmountForStripe = exports.calculateTotalWithFees = exports.calculatePlatformFee = exports.constructWebhookEvent = exports.getVerificationStatus = exports.uploadVerificationDocument = exports.refundDeposit = exports.releaseEscrowPayment = exports.createEscrowPayment = exports.getPaymentIntent = exports.confirmPaymentIntent = exports.createPaymentIntent = exports.updateCustomer = exports.getCustomer = exports.createCustomer = exports.createLoginLink = exports.getAccountStatus = exports.createAccountLink = exports.createConnectedAccount = void 0;
// src/utils/stripe.ts
const platform_1 = require("./platform");
// Conditionally import Stripe only in server environments
let Stripe = null;
let stripe = null;
exports.stripe = stripe;
// Only initialize Stripe in server environments (Node.js)
if ((0, platform_1.isNode)() && !(0, platform_1.isReactNative)()) {
    try {
        // Dynamic import to avoid bundling in React Native
        const StripeModule = require('stripe');
        Stripe = StripeModule.default || StripeModule;
        if (Stripe && process.env.STRIPE_SECRET_KEY) {
            exports.stripe = stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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
// ==================== CONNECT ACCOUNTS ====================
const createConnectedAccount = async (email, country = 'AU') => {
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
const getAccountStatus = async (accountId) => {
    const stripeInstance = requireStripe();
    const account = await stripeInstance.accounts.retrieve(accountId);
    return {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
        pending_verification: account.requirements?.pending_verification || [],
        disabled_reason: account.requirements?.disabled_reason,
        verification_status: {
            identity: account.individual?.verification?.status || 'unverified',
            document: account.individual?.verification?.document?.back
                ? 'verified'
                : account.individual?.verification?.document?.front
                    ? 'pending'
                    : 'unverified',
        },
        business_type: account.business_type,
        country: account.country,
    };
};
exports.getAccountStatus = getAccountStatus;
const createLoginLink = async (accountId) => {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
};
exports.createLoginLink = createLoginLink;
// ==================== CUSTOMERS ====================
const createCustomer = async ({ email, name, phone, metadata = {}, }) => {
    const customer = await stripe.customers.create({
        email,
        name,
        phone,
        metadata: {
            platform: 'rent-it-forward',
            ...metadata,
        },
    });
    return customer.id;
};
exports.createCustomer = createCustomer;
const getCustomer = async (customerId) => {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
};
exports.getCustomer = getCustomer;
const updateCustomer = async (customerId, updates) => {
    const customer = await stripe.customers.update(customerId, updates);
    return customer;
};
exports.updateCustomer = updateCustomer;
// ==================== PAYMENT INTENTS ====================
const createPaymentIntent = async ({ amount, currency = 'aud', applicationFeeAmount, connectedAccountId, customerId, metadata = {}, description, }) => {
    const intent = await stripe.paymentIntents.create({
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
const confirmPaymentIntent = async (paymentIntentId) => {
    const intent = await stripe.paymentIntents.confirm(paymentIntentId);
    return intent;
};
exports.confirmPaymentIntent = confirmPaymentIntent;
const getPaymentIntent = async (paymentIntentId) => {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return intent;
};
exports.getPaymentIntent = getPaymentIntent;
// ==================== ESCROW & DEPOSITS ====================
const createEscrowPayment = async ({ amount, depositAmount, currency = 'aud', applicationFeeAmount, connectedAccountId, customerId, bookingId, listingTitle, }) => {
    const totalAmount = amount + depositAmount;
    const intent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency,
        application_fee_amount: applicationFeeAmount,
        customer: customerId,
        description: `Rental payment for "${listingTitle}" (including $${(depositAmount / 100).toFixed(2)} security deposit)`,
        metadata: {
            platform: 'rent-it-forward',
            booking_id: bookingId,
            rental_amount: amount.toString(),
            deposit_amount: depositAmount.toString(),
            listing_title: listingTitle,
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
exports.createEscrowPayment = createEscrowPayment;
const releaseEscrowPayment = async (paymentIntentId, amountToRelease) => {
    // This would be handled through transfers or by updating the payment intent
    // For now, we'll create a transfer for the rental amount (excluding deposit)
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.transfer_data?.destination) {
        const transfer = await stripe.transfers.create({
            amount: amountToRelease,
            currency: intent.currency,
            destination: typeof intent.transfer_data.destination === 'string'
                ? intent.transfer_data.destination
                : intent.transfer_data.destination.id,
            description: `Rental payment release for ${intent.description}`,
            metadata: {
                original_payment_intent: paymentIntentId,
                type: 'rental_payment_release',
            },
        });
        return transfer.id;
    }
    throw new Error('No destination account found for escrow release');
};
exports.releaseEscrowPayment = releaseEscrowPayment;
const refundDeposit = async (paymentIntentId, depositAmount, reason) => {
    const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: depositAmount,
        reason: reason,
        metadata: {
            type: 'deposit_refund',
            platform: 'rent-it-forward',
        },
    });
    return refund.id;
};
exports.refundDeposit = refundDeposit;
// ==================== IDENTITY VERIFICATION ====================
const uploadVerificationDocument = async (accountId, documentType, frontImageData, backImageData) => {
    try {
        // Create file for front of document
        const frontFile = await stripe.files.create({
            purpose: 'identity_document',
            file: {
                data: Buffer.from(frontImageData, 'base64'),
                name: `${documentType}_front.jpg`,
                type: 'image/jpeg',
            },
        });
        let backFile;
        if (backImageData) {
            backFile = await stripe.files.create({
                purpose: 'identity_document',
                file: {
                    data: Buffer.from(backImageData, 'base64'),
                    name: `${documentType}_back.jpg`,
                    type: 'image/jpeg',
                },
            });
        }
        // Update the account with the document
        if (documentType === 'identity_document') {
            await stripe.accounts.update(accountId, {
                individual: {
                    verification: {
                        document: {
                            front: frontFile.id,
                            back: backFile?.id,
                        },
                    },
                },
            });
        }
        else if (documentType === 'address_document') {
            await stripe.accounts.update(accountId, {
                individual: {
                    verification: {
                        additional_document: {
                            front: frontFile.id,
                            back: backFile?.id,
                        },
                    },
                },
            });
        }
        return {
            front_file_id: frontFile.id,
            back_file_id: backFile?.id,
        };
    }
    catch (error) {
        console.error('Error uploading verification document:', error);
        throw error;
    }
};
exports.uploadVerificationDocument = uploadVerificationDocument;
const getVerificationStatus = async (accountId) => {
    const account = await stripe.accounts.retrieve(accountId);
    return {
        overall_status: account.details_submitted && account.charges_enabled && account.payouts_enabled
            ? 'verified'
            : account.details_submitted
                ? 'pending'
                : 'unverified',
        identity_verification: {
            status: account.individual?.verification?.status || 'unverified',
            details: account.individual?.verification?.details || null,
        },
        document_verification: {
            front_uploaded: !!account.individual?.verification?.document?.front,
            back_uploaded: !!account.individual?.verification?.document?.back,
            status: account.individual?.verification?.document?.details_code || 'not_uploaded',
        },
        requirements: {
            currently_due: account.requirements?.currently_due || [],
            eventually_due: account.requirements?.eventually_due || [],
            past_due: account.requirements?.past_due || [],
            pending_verification: account.requirements?.pending_verification || [],
        },
        capabilities: {
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
        },
        disabled_reason: account.requirements?.disabled_reason,
    };
};
exports.getVerificationStatus = getVerificationStatus;
// ==================== WEBHOOKS ====================
const constructWebhookEvent = (payload, signature) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured');
    }
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};
exports.constructWebhookEvent = constructWebhookEvent;
// ==================== PRICING & FEES ====================
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
// ==================== UTILITY FUNCTIONS ====================
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
const isTestMode = () => {
    return process.env.STRIPE_SECRET_KEY?.includes('sk_test_') || false;
};
exports.isTestMode = isTestMode;
