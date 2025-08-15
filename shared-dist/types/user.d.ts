import { z } from 'zod';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    MODERATOR = "moderator"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    BANNED = "banned"
}
export declare enum VerificationStatus {
    UNVERIFIED = "unverified",
    PENDING = "pending",
    VERIFIED = "verified",
    REJECTED = "rejected"
}
export declare const UserProfileSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodObject<{
        address: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postcode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    }, {
        address: string;
        city: string;
        state: string;
        postcode: string;
        country?: string | undefined;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    }>>;
    role: z.ZodDefault<z.ZodNativeEnum<typeof UserRole>>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof UserStatus>>;
    verificationStatus: z.ZodDefault<z.ZodNativeEnum<typeof VerificationStatus>>;
    verificationDocuments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    rating: z.ZodDefault<z.ZodNumber>;
    reviewCount: z.ZodDefault<z.ZodNumber>;
    joinedAt: z.ZodString;
    lastActiveAt: z.ZodOptional<z.ZodString>;
    preferences: z.ZodOptional<z.ZodObject<{
        emailNotifications: z.ZodDefault<z.ZodBoolean>;
        pushNotifications: z.ZodDefault<z.ZodBoolean>;
        smsNotifications: z.ZodDefault<z.ZodBoolean>;
        marketingEmails: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        emailNotifications: boolean;
        pushNotifications: boolean;
        smsNotifications: boolean;
        marketingEmails: boolean;
    }, {
        emailNotifications?: boolean | undefined;
        pushNotifications?: boolean | undefined;
        smsNotifications?: boolean | undefined;
        marketingEmails?: boolean | undefined;
    }>>;
    stripeAccountId: z.ZodOptional<z.ZodString>;
    stripeCustomerId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: UserStatus;
    rating: number;
    reviewCount: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    verificationStatus: VerificationStatus;
    joinedAt: string;
    location?: {
        address: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    } | undefined;
    displayName?: string | undefined;
    avatar?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    bio?: string | undefined;
    verificationDocuments?: string[] | undefined;
    lastActiveAt?: string | undefined;
    preferences?: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        smsNotifications: boolean;
        marketingEmails: boolean;
    } | undefined;
    stripeAccountId?: string | undefined;
    stripeCustomerId?: string | undefined;
}, {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    joinedAt: string;
    status?: UserStatus | undefined;
    location?: {
        address: string;
        city: string;
        state: string;
        postcode: string;
        country?: string | undefined;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    } | undefined;
    rating?: number | undefined;
    reviewCount?: number | undefined;
    displayName?: string | undefined;
    avatar?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    bio?: string | undefined;
    role?: UserRole | undefined;
    verificationStatus?: VerificationStatus | undefined;
    verificationDocuments?: string[] | undefined;
    lastActiveAt?: string | undefined;
    preferences?: {
        emailNotifications?: boolean | undefined;
        pushNotifications?: boolean | undefined;
        smsNotifications?: boolean | undefined;
        marketingEmails?: boolean | undefined;
    } | undefined;
    stripeAccountId?: string | undefined;
    stripeCustomerId?: string | undefined;
}>;
export declare const UserUpdateSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    avatar: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    dateOfBirth: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    bio: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    location: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        address: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postcode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    }, {
        address: string;
        city: string;
        state: string;
        postcode: string;
        country?: string | undefined;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    }>>>;
    role: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof UserRole>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof UserStatus>>>;
    verificationStatus: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof VerificationStatus>>>;
    verificationDocuments: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    rating: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    reviewCount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    joinedAt: z.ZodOptional<z.ZodString>;
    lastActiveAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    preferences: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        emailNotifications: z.ZodDefault<z.ZodBoolean>;
        pushNotifications: z.ZodDefault<z.ZodBoolean>;
        smsNotifications: z.ZodDefault<z.ZodBoolean>;
        marketingEmails: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        emailNotifications: boolean;
        pushNotifications: boolean;
        smsNotifications: boolean;
        marketingEmails: boolean;
    }, {
        emailNotifications?: boolean | undefined;
        pushNotifications?: boolean | undefined;
        smsNotifications?: boolean | undefined;
        marketingEmails?: boolean | undefined;
    }>>>;
    stripeAccountId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    stripeCustomerId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "id" | "role" | "joinedAt" | "stripeAccountId" | "stripeCustomerId">, "strip", z.ZodTypeAny, {
    status?: UserStatus | undefined;
    location?: {
        address: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    } | undefined;
    rating?: number | undefined;
    reviewCount?: number | undefined;
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    displayName?: string | undefined;
    avatar?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    bio?: string | undefined;
    verificationStatus?: VerificationStatus | undefined;
    verificationDocuments?: string[] | undefined;
    lastActiveAt?: string | undefined;
    preferences?: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        smsNotifications: boolean;
        marketingEmails: boolean;
    } | undefined;
}, {
    status?: UserStatus | undefined;
    location?: {
        address: string;
        city: string;
        state: string;
        postcode: string;
        country?: string | undefined;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    } | undefined;
    rating?: number | undefined;
    reviewCount?: number | undefined;
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    displayName?: string | undefined;
    avatar?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    bio?: string | undefined;
    verificationStatus?: VerificationStatus | undefined;
    verificationDocuments?: string[] | undefined;
    lastActiveAt?: string | undefined;
    preferences?: {
        emailNotifications?: boolean | undefined;
        pushNotifications?: boolean | undefined;
        smsNotifications?: boolean | undefined;
        marketingEmails?: boolean | undefined;
    } | undefined;
}>;
export declare const UserRegistrationSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    acceptTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    acceptTerms: boolean;
    phone?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    acceptTerms: boolean;
    phone?: string | undefined;
}>;
export declare const UserLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserLocation = UserProfile['location'];
