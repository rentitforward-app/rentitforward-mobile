"use strict";
// GraphQL Type Definitions for Rent It Forward
// Based on Supabase database schema analysis
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingStatus = void 0;
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["IN_PROGRESS"] = "in_progress";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["DISPUTED"] = "disputed";
    BookingStatus["PAYMENT_REQUIRED"] = "payment_required";
    BookingStatus["RETURN_PENDING"] = "return_pending";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
