"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLoginSchema = exports.UserRegistrationSchema = exports.UserUpdateSchema = exports.UserProfileSchema = exports.VerificationStatus = exports.UserStatus = exports.UserRole = void 0;
const zod_1 = require("zod");
// User Types
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
    UserRole["MODERATOR"] = "moderator";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["BANNED"] = "banned";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["UNVERIFIED"] = "unverified";
    VerificationStatus["PENDING"] = "pending";
    VerificationStatus["VERIFIED"] = "verified";
    VerificationStatus["REJECTED"] = "rejected";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
// User Profile Schema
exports.UserProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    displayName: zod_1.z.string().optional(),
    avatar: zod_1.z.string().url().optional(),
    phone: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().datetime().optional(),
    bio: zod_1.z.string().max(500).optional(),
    location: zod_1.z.object({
        address: zod_1.z.string(),
        city: zod_1.z.string(),
        state: zod_1.z.string(),
        postcode: zod_1.z.string(),
        country: zod_1.z.string().default('Australia'),
        coordinates: zod_1.z.object({
            lat: zod_1.z.number(),
            lng: zod_1.z.number()
        }).optional()
    }).optional(),
    role: zod_1.z.nativeEnum(UserRole).default(UserRole.USER),
    status: zod_1.z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
    verificationStatus: zod_1.z.nativeEnum(VerificationStatus).default(VerificationStatus.UNVERIFIED),
    verificationDocuments: zod_1.z.array(zod_1.z.string().url()).optional(),
    rating: zod_1.z.number().min(0).max(5).default(0),
    reviewCount: zod_1.z.number().min(0).default(0),
    joinedAt: zod_1.z.string().datetime(),
    lastActiveAt: zod_1.z.string().datetime().optional(),
    preferences: zod_1.z.object({
        emailNotifications: zod_1.z.boolean().default(true),
        pushNotifications: zod_1.z.boolean().default(true),
        smsNotifications: zod_1.z.boolean().default(false),
        marketingEmails: zod_1.z.boolean().default(false)
    }).optional(),
    stripeAccountId: zod_1.z.string().optional(),
    stripeCustomerId: zod_1.z.string().optional()
});
// User Update Schema
exports.UserUpdateSchema = exports.UserProfileSchema.partial().omit({
    id: true,
    joinedAt: true,
    role: true,
    stripeAccountId: true,
    stripeCustomerId: true
});
// User Registration Schema
exports.UserRegistrationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    phone: zod_1.z.string().optional(),
    acceptTerms: zod_1.z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
});
// User Login Schema
exports.UserLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1, 'Password is required')
});
