"use strict";
// Pricing utility functions for Rent It Forward
// Updated rates: 15% service fee, 20% commission, 10% insurance
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_RATES = void 0;
exports.calculateBookingPricing = calculateBookingPricing;
exports.formatPricingBreakdown = formatPricingBreakdown;
exports.pointsToCredit = pointsToCredit;
exports.creditToPoints = creditToPoints;
exports.getMaxApplicableCredit = getMaxApplicableCredit;
exports.applyCredit = applyCredit;
// Platform rates
exports.PLATFORM_RATES = {
    SERVICE_FEE_PERCENT: 0.15, // 15% added to renter total
    COMMISSION_PERCENT: 0.20, // 20% deducted from owner payout
    INSURANCE_PERCENT: 0.10, // 10% of daily rate per day
    POINTS_TO_CREDIT_RATE: 0.10, // 100 points = $10 AUD
};
/**
 * Calculate complete booking pricing breakdown
 */
function calculateBookingPricing(input) {
    const { dailyRate, numberOfDays, includeInsurance, securityDeposit = 0 } = input;
    // Base calculations
    const basePrice = dailyRate * numberOfDays;
    const serviceFee = basePrice * exports.PLATFORM_RATES.SERVICE_FEE_PERCENT;
    const insurance = includeInsurance ? (dailyRate * exports.PLATFORM_RATES.INSURANCE_PERCENT * numberOfDays) : 0;
    // Renter total
    const totalRenterPays = basePrice + serviceFee + insurance + securityDeposit;
    // Owner calculations
    const platformCommission = basePrice * exports.PLATFORM_RATES.COMMISSION_PERCENT;
    const ownerReceives = basePrice - platformCommission;
    return {
        basePrice,
        serviceFee,
        insurance,
        securityDeposit,
        totalRenterPays,
        platformCommission,
        ownerReceives,
        dailyRate,
        numberOfDays,
    };
}
/**
 * Format pricing for display
 */
function formatPricingBreakdown(pricing) {
    return `
Base Price: $${pricing.basePrice.toFixed(2)} (${pricing.numberOfDays} days × $${pricing.dailyRate.toFixed(2)})
Service Fee: $${pricing.serviceFee.toFixed(2)} (15%)
${pricing.insurance > 0 ? `Insurance: $${pricing.insurance.toFixed(2)} (10% daily)\n` : ''}${pricing.securityDeposit > 0 ? `Security Deposit: $${pricing.securityDeposit.toFixed(2)}\n` : ''}
TOTAL: $${pricing.totalRenterPays.toFixed(2)}

Owner Receives: $${pricing.ownerReceives.toFixed(2)} (after 20% commission)
  `.trim();
}
/**
 * Convert user points to credit value
 */
function pointsToCredit(points) {
    return points * exports.PLATFORM_RATES.POINTS_TO_CREDIT_RATE;
}
/**
 * Convert credit amount to required points
 */
function creditToPoints(creditAmount) {
    return Math.ceil(creditAmount / exports.PLATFORM_RATES.POINTS_TO_CREDIT_RATE);
}
/**
 * Calculate maximum credit that can be applied to a booking
 * (typically limited to avoid negative totals)
 */
function getMaxApplicableCredit(totalAmount, maxCreditPercent = 0.50) {
    return totalAmount * maxCreditPercent;
}
/**
 * Apply credit to booking total
 */
function applyCredit(pricing, creditAmount) {
    const maxCredit = getMaxApplicableCredit(pricing.totalRenterPays);
    const creditApplied = Math.min(creditAmount, maxCredit);
    const finalTotal = Math.max(0, pricing.totalRenterPays - creditApplied);
    return {
        ...pricing,
        creditApplied,
        finalTotal,
    };
}
