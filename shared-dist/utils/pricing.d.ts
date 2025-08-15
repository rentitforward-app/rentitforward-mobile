export interface PricingCalculation {
    basePrice: number;
    serviceFee: number;
    insurance: number;
    securityDeposit: number;
    totalRenterPays: number;
    platformCommission: number;
    ownerReceives: number;
    dailyRate: number;
    numberOfDays: number;
}
export interface PricingInput {
    dailyRate: number;
    numberOfDays: number;
    includeInsurance: boolean;
    securityDeposit?: number;
}
export declare const PLATFORM_RATES: {
    readonly SERVICE_FEE_PERCENT: 0.15;
    readonly COMMISSION_PERCENT: 0.2;
    readonly INSURANCE_PERCENT: 0.1;
    readonly POINTS_TO_CREDIT_RATE: 0.1;
};
/**
 * Calculate complete booking pricing breakdown
 */
export declare function calculateBookingPricing(input: PricingInput): PricingCalculation;
/**
 * Format pricing for display
 */
export declare function formatPricingBreakdown(pricing: PricingCalculation): string;
/**
 * Convert user points to credit value
 */
export declare function pointsToCredit(points: number): number;
/**
 * Convert credit amount to required points
 */
export declare function creditToPoints(creditAmount: number): number;
/**
 * Calculate maximum credit that can be applied to a booking
 * (typically limited to avoid negative totals)
 */
export declare function getMaxApplicableCredit(totalAmount: number, maxCreditPercent?: number): number;
/**
 * Apply credit to booking total
 */
export declare function applyCredit(pricing: PricingCalculation, creditAmount: number): PricingCalculation & {
    creditApplied: number;
    finalTotal: number;
};
