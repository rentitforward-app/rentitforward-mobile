export declare const COLORS: {
    readonly primary: "#44D62C";
    readonly secondary: "#343C3E";
    readonly accent: "#FFFFFF";
    readonly background: "#F8F9FA";
    readonly text: {
        readonly primary: "#1A1A1A";
        readonly secondary: "#6B7280";
        readonly light: "#9CA3AF";
    };
    readonly status: {
        readonly success: "#10B981";
        readonly warning: "#F59E0B";
        readonly error: "#EF4444";
        readonly info: "#3B82F6";
    };
    readonly border: "#E5E7EB";
    readonly shadow: "rgba(0, 0, 0, 0.1)";
};
export declare const FONTS: {
    readonly primary: "Poppins";
    readonly secondary: "Roboto";
    readonly mono: "Monaco, monospace";
};
export declare const CATEGORIES: {
    readonly TOOLS_DIY_EQUIPMENT: {
        readonly label: "Tools & DIY Equipment";
        readonly icon: "🔧";
        readonly color: "#FF6B35";
    };
    readonly CAMERAS_PHOTOGRAPHY_GEAR: {
        readonly label: "Cameras & Photography Gear";
        readonly icon: "📷";
        readonly color: "#45B7D1";
    };
    readonly EVENT_PARTY_EQUIPMENT: {
        readonly label: "Event & Party Equipment";
        readonly icon: "🎉";
        readonly color: "#FECA57";
    };
    readonly CAMPING_OUTDOOR_GEAR: {
        readonly label: "Camping & Outdoor Gear";
        readonly icon: "🏕️";
        readonly color: "#96CEB4";
    };
    readonly TECH_ELECTRONICS: {
        readonly label: "Tech & Electronics";
        readonly icon: "📱";
        readonly color: "#4ECDC4";
    };
    readonly VEHICLES_TRANSPORT: {
        readonly label: "Vehicles & Transport";
        readonly icon: "🚗";
        readonly color: "#54A0FF";
    };
    readonly HOME_GARDEN_APPLIANCES: {
        readonly label: "Home & Garden Appliances";
        readonly icon: "🏡";
        readonly color: "#5F27CD";
    };
    readonly SPORTS_FITNESS_EQUIPMENT: {
        readonly label: "Sports & Fitness Equipment";
        readonly icon: "🏃";
        readonly color: "#FF9F43";
    };
    readonly MUSICAL_INSTRUMENTS_GEAR: {
        readonly label: "Musical Instruments & Gear";
        readonly icon: "🎸";
        readonly color: "#FF9FF3";
    };
    readonly COSTUMES_PROPS: {
        readonly label: "Costumes & Props";
        readonly icon: "🎭";
        readonly color: "#A4B0BE";
    };
    readonly MAKER_CRAFT_SUPPLIES: {
        readonly label: "Maker & Craft Supplies";
        readonly icon: "✂️";
        readonly color: "#2ED573";
    };
};
export declare const AUSTRALIAN_STATES: readonly [{
    readonly code: "NSW";
    readonly name: "New South Wales";
}, {
    readonly code: "VIC";
    readonly name: "Victoria";
}, {
    readonly code: "QLD";
    readonly name: "Queensland";
}, {
    readonly code: "WA";
    readonly name: "Western Australia";
}, {
    readonly code: "SA";
    readonly name: "South Australia";
}, {
    readonly code: "TAS";
    readonly name: "Tasmania";
}, {
    readonly code: "ACT";
    readonly name: "Australian Capital Territory";
}, {
    readonly code: "NT";
    readonly name: "Northern Territory";
}];
export declare const BUSINESS_RULES: {
    readonly MIN_PRICE: 1;
    readonly MAX_PRICE: 10000;
    readonly DEFAULT_CURRENCY: "AUD";
    readonly MIN_RENTAL_DAYS: 1;
    readonly MAX_RENTAL_DAYS: 365;
    readonly MAX_ADVANCE_BOOKING_DAYS: 365;
    readonly MAX_IMAGES_PER_LISTING: 10;
    readonly MAX_IMAGE_SIZE_MB: 10;
    readonly SUPPORTED_IMAGE_FORMATS: readonly ["jpg", "jpeg", "png", "webp"];
    readonly MAX_TITLE_LENGTH: 100;
    readonly MAX_DESCRIPTION_LENGTH: 2000;
    readonly MAX_BIO_LENGTH: 500;
    readonly DEFAULT_SEARCH_RADIUS: 10;
    readonly MAX_SEARCH_RADIUS: 100;
    readonly DEFAULT_SEARCH_LIMIT: 20;
    readonly MAX_SEARCH_LIMIT: 100;
    readonly MIN_RATING: 1;
    readonly MAX_RATING: 5;
    readonly SERVICE_FEE_PERCENTAGE: 0.15;
    readonly PLATFORM_COMMISSION_PERCENTAGE: 0.2;
    readonly INSURANCE_PERCENTAGE: 0.1;
    readonly PAYMENT_PROCESSING_FEE: 0.029;
    readonly GST_RATE: 0.1;
    readonly POINTS_TO_DOLLAR_RATE: 0.1;
};
export declare const ERROR_MESSAGES: {
    readonly REQUIRED_FIELD: "This field is required";
    readonly INVALID_EMAIL: "Please enter a valid email address";
    readonly INVALID_PHONE: "Please enter a valid Australian phone number";
    readonly INVALID_POSTCODE: "Please enter a valid Australian postcode";
    readonly PASSWORD_TOO_SHORT: "Password must be at least 8 characters";
    readonly PASSWORDS_DONT_MATCH: "Passwords do not match";
    readonly INVALID_DATE: "Please enter a valid date";
    readonly INVALID_PRICE: "Please enter a valid price";
    readonly IMAGE_TOO_LARGE: "Image file is too large";
    readonly UNSUPPORTED_FILE_TYPE: "File type not supported";
    readonly GENERIC_ERROR: "Something went wrong. Please try again.";
};
export declare const SUCCESS_MESSAGES: {
    readonly ACCOUNT_CREATED: "Account created successfully";
    readonly LOGIN_SUCCESS: "Logged in successfully";
    readonly LISTING_CREATED: "Listing created successfully";
    readonly LISTING_UPDATED: "Listing updated successfully";
    readonly BOOKING_CREATED: "Booking request sent successfully";
    readonly BOOKING_CONFIRMED: "Booking confirmed successfully";
    readonly MESSAGE_SENT: "Message sent successfully";
    readonly PROFILE_UPDATED: "Profile updated successfully";
    readonly REVIEW_SUBMITTED: "Review submitted successfully";
};
export declare const API_ENDPOINTS: {
    readonly LOGIN: "/api/auth/login";
    readonly REGISTER: "/api/auth/register";
    readonly LOGOUT: "/api/auth/logout";
    readonly REFRESH: "/api/auth/refresh";
    readonly USERS: "/api/users";
    readonly USER_PROFILE: "/api/users/profile";
    readonly USER_LISTINGS: "/api/users/listings";
    readonly USER_BOOKINGS: "/api/users/bookings";
    readonly LISTINGS: "/api/listings";
    readonly LISTING_SEARCH: "/api/listings/search";
    readonly LISTING_UPLOAD: "/api/listings/upload";
    readonly BOOKINGS: "/api/bookings";
    readonly BOOKING_CONFIRM: "/api/bookings/confirm";
    readonly BOOKING_CANCEL: "/api/bookings/cancel";
    readonly MESSAGES: "/api/messages";
    readonly CONVERSATIONS: "/api/conversations";
    readonly REVIEWS: "/api/reviews";
    readonly PAYMENTS: "/api/payments";
    readonly STRIPE_CONNECT: "/api/payments/stripe/connect";
    readonly ADMIN_USERS: "/api/admin/users";
    readonly ADMIN_LISTINGS: "/api/admin/listings";
    readonly ADMIN_BOOKINGS: "/api/admin/bookings";
};
export declare const STORAGE_BUCKETS: {
    readonly LISTING_IMAGES: "listing-images";
    readonly USER_AVATARS: "user-avatars";
    readonly VERIFICATION_DOCS: "verification-documents";
    readonly MESSAGE_ATTACHMENTS: "message-attachments";
};
export declare const DATE_FORMATS: {
    readonly DISPLAY: "dd/MM/yyyy";
    readonly API: "yyyy-MM-dd";
    readonly DATETIME: "dd/MM/yyyy HH:mm";
    readonly TIME: "HH:mm";
};
export declare const REGEX_PATTERNS: {
    readonly EMAIL: RegExp;
    readonly PHONE_AU: RegExp;
    readonly POSTCODE_AU: RegExp;
    readonly PASSWORD: RegExp;
};
