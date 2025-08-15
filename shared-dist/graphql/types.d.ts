export interface User {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    phone_number?: string;
    bio?: string;
    location?: {
        coordinates: [number, number];
    };
    address?: string;
    city?: string;
    state?: string;
    country: string;
    postal_code?: string;
    rating: number;
    total_reviews: number;
    verified: boolean;
    points: number;
    referral_code?: string;
    referred_by?: string;
    stripe_account_id?: string;
    stripe_onboarded: boolean;
    stripe_customer_id?: string;
    identity_verified: boolean;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
}
export interface Listing {
    id: string;
    title: string;
    description: string;
    category: string;
    category_id?: string;
    price_per_day: number;
    price_hourly?: number;
    price_weekly?: number;
    currency: string;
    location: {
        coordinates: [number, number];
    };
    address: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
    images: string[];
    features: string[];
    condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
    brand?: string;
    model?: string;
    year?: number;
    deposit?: number;
    insurance_enabled: boolean;
    delivery_available: boolean;
    pickup_available: boolean;
    is_active: boolean;
    available_from?: string;
    available_to?: string;
    owner_id: string;
    owner?: User;
    view_count: number;
    favorite_count: number;
    booking_count: number;
    rating: number;
    review_count: number;
    approval_status: 'pending' | 'approved' | 'rejected';
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
    reviews?: Review[];
    bookings?: Booking[];
    availability?: ListingAvailability[];
    photos?: ListingPhoto[];
}
export interface Booking {
    id: string;
    listing_id: string;
    listing?: Listing;
    renter_id: string;
    renter?: User;
    owner_id: string;
    owner?: User;
    start_date: string;
    end_date: string;
    total_days: number;
    duration_days?: number;
    price_per_day: number;
    subtotal: number;
    service_fee: number;
    platform_fee: number;
    insurance_fee: number;
    deposit_amount: number;
    total_amount: number;
    delivery_method?: 'pickup' | 'delivery';
    delivery_address?: string;
    status: BookingStatus;
    payment_status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
    deposit_status: 'held' | 'refunded' | 'deducted';
    payer_confirmed: boolean;
    owner_confirmed: boolean;
    pickup_confirmed_by_renter: boolean;
    pickup_confirmed_by_owner: boolean;
    pickup_confirmed_at?: string;
    return_confirmed_by_renter: boolean;
    return_confirmed_by_owner: boolean;
    return_confirmed_at?: string;
    owner_receipt_confirmed_at?: string;
    renter_message?: string;
    owner_response?: string;
    pickup_notes?: string;
    return_notes?: string;
    owner_receipt_notes?: string;
    pickup_instructions?: string;
    return_instructions?: string;
    pickup_location?: string;
    return_location?: string;
    condition_before?: string;
    condition_after?: string;
    final_condition?: string;
    damage_report?: string;
    has_issues: boolean;
    pickup_images?: any;
    return_images?: any;
    payment_intent_id?: string;
    stripe_payment_intent_id?: string;
    stripe_transfer_id?: string;
    stripe_session_id?: string;
    paid_at?: string;
    payment_date?: string;
    admin_released_by?: string;
    admin_released_at?: string;
    created_at: string;
    updated_at: string;
    reviews?: Review[];
    payments?: Payment[];
    messages?: Message[];
}
export declare enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    DISPUTED = "disputed",
    PAYMENT_REQUIRED = "payment_required",
    RETURN_PENDING = "return_pending"
}
export interface Review {
    id: string;
    booking_id: string;
    booking?: Booking;
    reviewer_id: string;
    reviewer?: User;
    reviewee_id: string;
    reviewee?: User;
    rating: number;
    comment?: string;
    type: 'renter_to_owner' | 'owner_to_renter';
    created_at: string;
    updated_at: string;
}
export interface Payment {
    id: string;
    booking_id: string;
    booking?: Booking;
    stripe_payment_intent_id: string;
    stripe_client_secret?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
    payment_method_id?: string;
    payment_method_type?: string;
    platform_fee: number;
    stripe_fee: number;
    net_amount?: number;
    payout_id?: string;
    payout_date?: string;
    refund_id?: string;
    refund_amount?: number;
    refund_reason?: string;
    refunded_at?: string;
    metadata?: any;
    created_at: string;
    updated_at: string;
}
export interface Message {
    id: string;
    sender_id: string;
    sender?: User;
    receiver_id: string;
    receiver?: User;
    conversation_id?: string;
    conversation?: Conversation;
    booking_id?: string;
    booking?: Booking;
    content: string;
    message_type: 'text' | 'image' | 'file';
    metadata?: any;
    is_read: boolean;
    read_at?: string;
    created_at: string;
    updated_at: string;
}
export interface Conversation {
    id: string;
    participants: string[];
    booking_id?: string;
    booking?: Booking;
    listing_id?: string;
    listing?: Listing;
    last_message?: string;
    last_message_at?: string;
    created_at: string;
    updated_at: string;
    messages?: Message[];
}
export interface Category {
    id: string;
    name: string;
    icon?: string;
    description?: string;
    created_at: string;
    listings?: Listing[];
}
export interface ListingPhoto {
    id: string;
    listing_id: string;
    listing?: Listing;
    url: string;
    thumbnail_url?: string;
    alt_text?: string;
    order_index: number;
    created_at: string;
}
export interface ListingAvailability {
    id: string;
    listing_id: string;
    listing?: Listing;
    date: string;
    is_available: boolean;
    created_at: string;
}
export interface Favorite {
    id: string;
    user_id: string;
    user?: User;
    listing_id: string;
    listing?: Listing;
    created_at: string;
}
export interface Notification {
    id: string;
    user_id: string;
    user?: User;
    title: string;
    message: string;
    type: 'booking' | 'message' | 'payment' | 'listing' | 'system';
    related_id?: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}
export interface Incentive {
    id: string;
    user_id: string;
    user?: User;
    booking_id?: string;
    booking?: Booking;
    action: 'first_rental' | 'referral' | 'review' | 'milestone';
    points: number;
    description?: string;
    created_at: string;
}
export interface CreateListingInput {
    title: string;
    description: string;
    category: string;
    category_id?: string;
    price_per_day: number;
    price_hourly?: number;
    price_weekly?: number;
    currency?: string;
    address: string;
    city: string;
    state?: string;
    country?: string;
    postal_code?: string;
    images: string[];
    features?: string[];
    condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
    brand?: string;
    model?: string;
    year?: number;
    deposit?: number;
    insurance_enabled?: boolean;
    delivery_available?: boolean;
    pickup_available?: boolean;
    available_from?: string;
    available_to?: string;
}
export interface UpdateListingInput {
    title?: string;
    description?: string;
    category?: string;
    price_per_day?: number;
    price_hourly?: number;
    price_weekly?: number;
    images?: string[];
    features?: string[];
    condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
    brand?: string;
    model?: string;
    year?: number;
    deposit?: number;
    insurance_enabled?: boolean;
    delivery_available?: boolean;
    pickup_available?: boolean;
    available_from?: string;
    available_to?: string;
    is_active?: boolean;
}
export interface CreateBookingInput {
    listing_id: string;
    start_date: string;
    end_date: string;
    delivery_method?: 'pickup' | 'delivery';
    delivery_address?: string;
    renter_message?: string;
    pickup_location?: string;
    return_location?: string;
}
export interface CreateReviewInput {
    booking_id: string;
    reviewee_id: string;
    rating: number;
    comment?: string;
    type: 'renter_to_owner' | 'owner_to_renter';
}
export interface SendMessageInput {
    receiver_id: string;
    conversation_id?: string;
    booking_id?: string;
    content: string;
    message_type?: 'text' | 'image' | 'file';
    metadata?: any;
}
export interface UpdateProfileInput {
    full_name?: string;
    avatar_url?: string;
    phone_number?: string;
    bio?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
}
export interface ListingFilter {
    category?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    city?: string;
    state?: string;
    country?: string;
    condition?: string[];
    delivery_available?: boolean;
    pickup_available?: boolean;
    insurance_enabled?: boolean;
    available_from?: string;
    available_to?: string;
    search?: string;
    owner_id?: string;
    is_active?: boolean;
    approval_status?: string;
    features?: string[];
    brand?: string;
    near_location?: {
        coordinates: [number, number];
        radius_km: number;
    };
}
export interface ListingSort {
    field: 'created_at' | 'updated_at' | 'price_per_day' | 'rating' | 'view_count' | 'distance';
    direction: 'ASC' | 'DESC';
}
export interface BookingFilter {
    status?: BookingStatus[];
    payment_status?: string[];
    renter_id?: string;
    owner_id?: string;
    listing_id?: string;
    start_date_from?: string;
    start_date_to?: string;
    end_date_from?: string;
    end_date_to?: string;
}
export interface BookingSort {
    field: 'created_at' | 'updated_at' | 'start_date' | 'end_date' | 'total_amount';
    direction: 'ASC' | 'DESC';
}
export interface PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
}
export interface Connection<T> {
    edges: Array<{
        node: T;
        cursor: string;
    }>;
    pageInfo: PageInfo;
    totalCount: number;
}
export type ListingConnection = Connection<Listing>;
export type BookingConnection = Connection<Booking>;
export type ReviewConnection = Connection<Review>;
export type MessageConnection = Connection<Message>;
export type NotificationConnection = Connection<Notification>;
export interface UserDashboard {
    user: User;
    stats: {
        active_listings: number;
        total_bookings_as_owner: number;
        total_bookings_as_renter: number;
        total_earnings: number;
        pending_payouts: number;
        unread_messages: number;
        unread_notifications: number;
    };
    recent_bookings: Booking[];
    recent_messages: Message[];
    pending_reviews: Booking[];
}
export interface AdminDashboard {
    stats: {
        total_users: number;
        total_listings: number;
        total_bookings: number;
        total_revenue: number;
        pending_approvals: number;
        active_disputes: number;
    };
    recent_signups: User[];
    pending_listings: Listing[];
    recent_bookings: Booking[];
    revenue_by_month: Array<{
        month: string;
        revenue: number;
        bookings: number;
    }>;
}
export interface SearchResult {
    listings: Listing[];
    total_count: number;
    facets: {
        categories: Array<{
            name: string;
            count: number;
        }>;
        price_ranges: Array<{
            range: string;
            count: number;
        }>;
        conditions: Array<{
            condition: string;
            count: number;
        }>;
        locations: Array<{
            city: string;
            state: string;
            count: number;
        }>;
    };
}
export interface SearchInput {
    query?: string;
    filters?: ListingFilter;
    sort?: ListingSort;
    pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
    };
}
export interface GraphQLError {
    message: string;
    code: string;
    path?: string[];
    extensions?: {
        field?: string;
        validation?: string;
        authorization?: boolean;
    };
}
export interface MutationResponse {
    success: boolean;
    message?: string;
    errors?: GraphQLError[];
}
export interface CreateListingResponse extends MutationResponse {
    listing?: Listing;
}
export interface CreateBookingResponse extends MutationResponse {
    booking?: Booking;
}
export interface CreateReviewResponse extends MutationResponse {
    review?: Review;
}
export interface SendMessageResponse extends MutationResponse {
    sentMessage?: Message;
}
export interface UpdateProfileResponse extends MutationResponse {
    user?: User;
}
