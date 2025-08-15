"use strict";
// GraphQL Schema Definition for Rent It Forward
// This schema follows the type-first approach and defines all queries, mutations, and subscriptions
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
exports.typeDefs = `
  scalar DateTime
  scalar JSON
  scalar Upload

  # Core User Types
  type User {
    id: ID!
    email: String!
    full_name: String!
    avatar_url: String
    phone_number: String
    bio: String
    location: Location
    address: String
    city: String
    state: String
    country: String!
    postal_code: String
    rating: Float!
    total_reviews: Int!
    verified: Boolean!
    points: Int!
    referral_code: String
    referred_by: ID
    stripe_account_id: String
    stripe_onboarded: Boolean!
    stripe_customer_id: String
    identity_verified: Boolean!
    role: UserRole!
    created_at: DateTime!
    updated_at: DateTime!
    
    # Related data (resolved via DataLoader)
    listings(filter: ListingFilter, sort: ListingSort, first: Int, after: String): ListingConnection
    bookings_as_renter(filter: BookingFilter, sort: BookingSort, first: Int, after: String): BookingConnection
    bookings_as_owner(filter: BookingFilter, sort: BookingSort, first: Int, after: String): BookingConnection
    reviews_given(first: Int, after: String): ReviewConnection
    reviews_received(first: Int, after: String): ReviewConnection
    favorites(first: Int, after: String): FavoriteConnection
    conversations(first: Int, after: String): ConversationConnection
    notifications(unread_only: Boolean, first: Int, after: String): NotificationConnection
  }

  enum UserRole {
    USER
    ADMIN
  }

  type Location {
    coordinates: [Float!]! # [longitude, latitude]
    address: String
    city: String
    state: String
    country: String
    postal_code: String
  }

  # Listing Types
  type Listing {
    id: ID!
    title: String!
    description: String!
    category: String!
    category_id: ID
    price_per_day: Float!
    price_hourly: Float
    price_weekly: Float
    currency: String!
    location: Location!
    address: String!
    city: String!
    state: String
    country: String!
    postal_code: String
    images: [String!]!
    features: [String!]!
    condition: ItemCondition!
    brand: String
    model: String
    year: Int
    deposit: Float
    insurance_enabled: Boolean!
    delivery_available: Boolean!
    pickup_available: Boolean!
    is_active: Boolean!
    available_from: DateTime
    available_to: DateTime
    owner_id: ID!
    view_count: Int!
    favorite_count: Int!
    booking_count: Int!
    rating: Float!
    review_count: Int!
    approval_status: ApprovalStatus!
    approved_by: ID
    approved_at: DateTime
    rejection_reason: String
    created_at: DateTime!
    updated_at: DateTime!
    
    # Related data
    owner: User!
    category_info: Category
    reviews(first: Int, after: String): ReviewConnection
    bookings(filter: BookingFilter, first: Int, after: String): BookingConnection
    availability(from: DateTime, to: DateTime): [ListingAvailability!]!
    photos: [ListingPhoto!]!
    is_favorited_by_user(user_id: ID): Boolean
  }

  enum ItemCondition {
    NEW
    LIKE_NEW
    GOOD
    FAIR
    POOR
  }

  enum ApprovalStatus {
    PENDING
    APPROVED
    REJECTED
  }

  type ListingPhoto {
    id: ID!
    listing_id: ID!
    url: String!
    thumbnail_url: String
    alt_text: String
    order_index: Int!
    created_at: DateTime!
  }

  type ListingAvailability {
    id: ID!
    listing_id: ID!
    date: DateTime!
    is_available: Boolean!
    created_at: DateTime!
  }

  # Booking Types
  type Booking {
    id: ID!
    listing_id: ID!
    renter_id: ID!
    owner_id: ID!
    start_date: DateTime!
    end_date: DateTime!
    total_days: Int!
    duration_days: Int
    price_per_day: Float!
    subtotal: Float!
    service_fee: Float!
    platform_fee: Float!
    insurance_fee: Float!
    deposit_amount: Float!
    total_amount: Float!
    delivery_method: DeliveryMethod
    delivery_address: String
    
    # Status fields
    status: BookingStatus!
    payment_status: PaymentStatus!
    deposit_status: DepositStatus!
    
    # Confirmation fields
    payer_confirmed: Boolean!
    owner_confirmed: Boolean!
    pickup_confirmed_by_renter: Boolean!
    pickup_confirmed_by_owner: Boolean!
    pickup_confirmed_at: DateTime
    return_confirmed_by_renter: Boolean!
    return_confirmed_by_owner: Boolean!
    return_confirmed_at: DateTime
    owner_receipt_confirmed_at: DateTime
    
    # Messages and notes
    renter_message: String
    owner_response: String
    pickup_notes: String
    return_notes: String
    owner_receipt_notes: String
    pickup_instructions: String
    return_instructions: String
    
    # Location and logistics
    pickup_location: String
    return_location: String
    
    # Condition tracking
    condition_before: String
    condition_after: String
    final_condition: String
    damage_report: String
    has_issues: Boolean!
    
    # Images
    pickup_images: JSON
    return_images: JSON
    
    # Stripe integration
    payment_intent_id: String
    stripe_payment_intent_id: String
    stripe_transfer_id: String
    stripe_session_id: String
    paid_at: DateTime
    payment_date: DateTime
    
    # Admin controls
    admin_released_by: ID
    admin_released_at: DateTime
    
    created_at: DateTime!
    updated_at: DateTime!
    
    # Related data
    listing: Listing!
    renter: User!
    owner: User!
    reviews: [Review!]!
    payments: [Payment!]!
    conversation: Conversation
    can_review: Boolean!
    can_cancel: Boolean!
    can_confirm_pickup: Boolean!
    can_confirm_return: Boolean!
  }

  enum BookingStatus {
    PENDING
    CONFIRMED
    IN_PROGRESS
    COMPLETED
    CANCELLED
    DISPUTED
    PAYMENT_REQUIRED
    RETURN_PENDING
  }

  enum PaymentStatus {
    PENDING
    PROCESSING
    SUCCEEDED
    FAILED
    REFUNDED
  }

  enum DepositStatus {
    HELD
    REFUNDED
    DEDUCTED
  }

  enum DeliveryMethod {
    PICKUP
    DELIVERY
  }

  # Review Types
  type Review {
    id: ID!
    booking_id: ID!
    reviewer_id: ID!
    reviewee_id: ID!
    rating: Int! # 1-5
    comment: String
    type: ReviewType!
    created_at: DateTime!
    updated_at: DateTime!
    
    # Related data
    booking: Booking!
    reviewer: User!
    reviewee: User!
  }

  enum ReviewType {
    RENTER_TO_OWNER
    OWNER_TO_RENTER
  }

  # Payment Types
  type Payment {
    id: ID!
    booking_id: ID!
    stripe_payment_intent_id: String!
    stripe_client_secret: String
    amount: Float!
    currency: String!
    status: PaymentStatus!
    payment_method_id: String
    payment_method_type: String
    platform_fee: Float!
    stripe_fee: Float!
    net_amount: Float
    payout_id: String
    payout_date: DateTime
    refund_id: String
    refund_amount: Float
    refund_reason: String
    refunded_at: DateTime
    metadata: JSON
    created_at: DateTime!
    updated_at: DateTime!
    
    # Related data
    booking: Booking!
  }

  # Messaging Types
  type Message {
    id: ID!
    sender_id: ID!
    receiver_id: ID!
    conversation_id: ID
    booking_id: ID
    content: String!
    message_type: MessageType!
    metadata: JSON
    is_read: Boolean!
    read_at: DateTime
    created_at: DateTime!
    updated_at: DateTime!
    
    # Related data
    sender: User!
    receiver: User!
    conversation: Conversation
    booking: Booking
  }

  enum MessageType {
    TEXT
    IMAGE
    FILE
  }

  type Conversation {
    id: ID!
    participants: [ID!]!
    booking_id: ID
    listing_id: ID
    last_message: String
    last_message_at: DateTime
    created_at: DateTime!
    updated_at: DateTime!
    
    # Related data
    booking: Booking
    listing: Listing
    messages(first: Int, after: String): MessageConnection!
    participants_info: [User!]!
    unread_count(user_id: ID!): Int!
  }

  # Category Types
  type Category {
    id: ID!
    name: String!
    icon: String
    description: String
    created_at: DateTime!
    
    # Related data
    listings_count: Int!
    listings(filter: ListingFilter, first: Int, after: String): ListingConnection
  }

  # Favorite Types
  type Favorite {
    id: ID!
    user_id: ID!
    listing_id: ID!
    created_at: DateTime!
    
    # Related data
    user: User!
    listing: Listing!
  }

  # Notification Types
  type Notification {
    id: ID!
    user_id: ID!
    title: String!
    message: String!
    type: NotificationType!
    related_id: ID
    is_read: Boolean!
    created_at: DateTime!
    updated_at: DateTime!
    
    # Related data
    user: User!
  }

  enum NotificationType {
    BOOKING
    MESSAGE
    PAYMENT
    LISTING
    SYSTEM
  }

  # Incentive Types
  type Incentive {
    id: ID!
    user_id: ID!
    booking_id: ID
    action: IncentiveAction!
    points: Int!
    description: String
    created_at: DateTime!
    
    # Related data
    user: User!
    booking: Booking
  }

  enum IncentiveAction {
    FIRST_RENTAL
    REFERRAL
    REVIEW
    MILESTONE
  }

  # Connection Types for Pagination
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type ListingEdge {
    node: Listing!
    cursor: String!
  }

  type ListingConnection {
    edges: [ListingEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type BookingEdge {
    node: Booking!
    cursor: String!
  }

  type BookingConnection {
    edges: [BookingEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ReviewEdge {
    node: Review!
    cursor: String!
  }

  type ReviewConnection {
    edges: [ReviewEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type MessageEdge {
    node: Message!
    cursor: String!
  }

  type MessageConnection {
    edges: [MessageEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ConversationEdge {
    node: Conversation!
    cursor: String!
  }

  type ConversationConnection {
    edges: [ConversationEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type NotificationEdge {
    node: Notification!
    cursor: String!
  }

  type NotificationConnection {
    edges: [NotificationEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type FavoriteEdge {
    node: Favorite!
    cursor: String!
  }

  type FavoriteConnection {
    edges: [FavoriteEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # Dashboard Types
  type UserStats {
    active_listings: Int!
    total_bookings_as_owner: Int!
    total_bookings_as_renter: Int!
    total_earnings: Float!
    pending_payouts: Float!
    unread_messages: Int!
    unread_notifications: Int!
  }

  type UserDashboard {
    user: User!
    stats: UserStats!
    recent_bookings: [Booking!]!
    recent_messages: [Message!]!
    pending_reviews: [Booking!]!
  }

  type AdminStats {
    total_users: Int!
    total_listings: Int!
    total_bookings: Int!
    total_revenue: Float!
    pending_approvals: Int!
    active_disputes: Int!
  }

  type RevenueByMonth {
    month: String!
    revenue: Float!
    bookings: Int!
  }

  type AdminDashboard {
    stats: AdminStats!
    recent_signups: [User!]!
    pending_listings: [Listing!]!
    recent_bookings: [Booking!]!
    revenue_by_month: [RevenueByMonth!]!
  }

  # Search Types
  type SearchFacet {
    name: String!
    count: Int!
  }

  type PriceRangeFacet {
    range: String!
    count: Int!
  }

  type LocationFacet {
    city: String!
    state: String!
    count: Int!
  }

  type SearchFacets {
    categories: [SearchFacet!]!
    price_ranges: [PriceRangeFacet!]!
    conditions: [SearchFacet!]!
    locations: [LocationFacet!]!
  }

  type SearchResult {
    listings: [Listing!]!
    total_count: Int!
    facets: SearchFacets!
  }

  # Input Types for Filters and Sorting
  input LocationInput {
    coordinates: [Float!]! # [longitude, latitude]
    radius_km: Float
  }

  input ListingFilter {
    category: String
    category_id: ID
    min_price: Float
    max_price: Float
    city: String
    state: String
    country: String
    condition: [ItemCondition!]
    delivery_available: Boolean
    pickup_available: Boolean
    insurance_enabled: Boolean
    available_from: DateTime
    available_to: DateTime
    search: String
    owner_id: ID
    is_active: Boolean
    approval_status: ApprovalStatus
    features: [String!]
    brand: String
    near_location: LocationInput
  }

  input ListingSort {
    field: ListingSortField!
    direction: SortDirection!
  }

  enum ListingSortField {
    CREATED_AT
    UPDATED_AT
    PRICE_PER_DAY
    RATING
    VIEW_COUNT
    DISTANCE
  }

  enum SortDirection {
    ASC
    DESC
  }

  input BookingFilter {
    status: [BookingStatus!]
    payment_status: [PaymentStatus!]
    renter_id: ID
    owner_id: ID
    listing_id: ID
    start_date_from: DateTime
    start_date_to: DateTime
    end_date_from: DateTime
    end_date_to: DateTime
  }

  input BookingSort {
    field: BookingSortField!
    direction: SortDirection!
  }

  enum BookingSortField {
    CREATED_AT
    UPDATED_AT
    START_DATE
    END_DATE
    TOTAL_AMOUNT
  }

  input SearchInput {
    query: String
    filters: ListingFilter
    sort: ListingSort
    first: Int
    after: String
  }

  # Input Types for Mutations
  input CreateListingInput {
    title: String!
    description: String!
    category: String!
    category_id: ID
    price_per_day: Float!
    price_hourly: Float
    price_weekly: Float
    currency: String
    address: String!
    city: String!
    state: String
    country: String
    postal_code: String
    images: [String!]!
    features: [String!]
    condition: ItemCondition!
    brand: String
    model: String
    year: Int
    deposit: Float
    insurance_enabled: Boolean
    delivery_available: Boolean
    pickup_available: Boolean
    available_from: DateTime
    available_to: DateTime
  }

  input UpdateListingInput {
    title: String
    description: String
    category: String
    price_per_day: Float
    price_hourly: Float
    price_weekly: Float
    images: [String!]
    features: [String!]
    condition: ItemCondition
    brand: String
    model: String
    year: Int
    deposit: Float
    insurance_enabled: Boolean
    delivery_available: Boolean
    pickup_available: Boolean
    available_from: DateTime
    available_to: DateTime
    is_active: Boolean
  }

  input CreateBookingInput {
    listing_id: ID!
    start_date: DateTime!
    end_date: DateTime!
    delivery_method: DeliveryMethod
    delivery_address: String
    renter_message: String
    pickup_location: String
    return_location: String
  }

  input CreateReviewInput {
    booking_id: ID!
    reviewee_id: ID!
    rating: Int!
    comment: String
    type: ReviewType!
  }

  input SendMessageInput {
    receiver_id: ID!
    conversation_id: ID
    booking_id: ID
    content: String!
    message_type: MessageType
    metadata: JSON
  }

  input UpdateProfileInput {
    full_name: String
    avatar_url: String
    phone_number: String
    bio: String
    address: String
    city: String
    state: String
    postal_code: String
  }

  # Response Types for Mutations
  interface MutationResponse {
    success: Boolean!
    message: String
    errors: [String!]
  }

  type CreateListingResponse implements MutationResponse {
    success: Boolean!
    message: String
    errors: [String!]
    listing: Listing
  }

  type CreateBookingResponse implements MutationResponse {
    success: Boolean!
    message: String
    errors: [String!]
    booking: Booking
  }

  type CreateReviewResponse implements MutationResponse {
    success: Boolean!
    message: String
    errors: [String!]
    review: Review
  }

  type SendMessageResponse implements MutationResponse {
    success: Boolean!
    message: String
    errors: [String!]
    message_sent: Message
  }

  type UpdateProfileResponse implements MutationResponse {
    success: Boolean!
    message: String
    errors: [String!]
    user: User
  }

  # Root Query Type
  type Query {
    # Test query
    hello: String!
    
    # User queries
    me: User
    user(id: ID!): User
    users(filter: String, first: Int, after: String): [User!]!
    
    # Listing queries
    listing(id: ID!): Listing
    listings(filter: ListingFilter, sort: ListingSort, first: Int, after: String): ListingConnection!
    featured_listings(limit: Int): [Listing!]!
    nearby_listings(location: LocationInput!, radius_km: Float, limit: Int): [Listing!]!
    
    # Search
    search(input: SearchInput!): SearchResult!
    
    # Booking queries
    booking(id: ID!): Booking
    bookings(filter: BookingFilter, sort: BookingSort, first: Int, after: String): BookingConnection!
    
    # Review queries
    reviews(listing_id: ID, user_id: ID, first: Int, after: String): ReviewConnection!
    
    # Message queries
    conversation(id: ID!): Conversation
    conversations(user_id: ID!, first: Int, after: String): ConversationConnection!
    messages(conversation_id: ID!, first: Int, after: String): MessageConnection!
    
    # Category queries
    categories: [Category!]!
    category(id: ID!): Category
    
    # Dashboard queries
    user_dashboard(user_id: ID!): UserDashboard!
    admin_dashboard: AdminDashboard! # Requires admin role
    
    # Notification queries
    notifications(user_id: ID!, unread_only: Boolean, first: Int, after: String): NotificationConnection!
    
    # Favorite queries
    favorites(user_id: ID!, first: Int, after: String): FavoriteConnection!
    is_favorited(user_id: ID!, listing_id: ID!): Boolean!
  }

  # Root Mutation Type
  type Mutation {
    # Listing mutations
    createListing(input: CreateListingInput!): CreateListingResponse!
    updateListing(id: ID!, input: UpdateListingInput!): CreateListingResponse!
    deleteListing(id: ID!): MutationResponse!
    
    # Booking mutations
    createBooking(input: CreateBookingInput!): CreateBookingResponse!
    cancelBooking(id: ID!, reason: String): MutationResponse!
    confirmBooking(id: ID!): MutationResponse!
    confirmPickup(id: ID!, notes: String, images: [String!]): MutationResponse!
    confirmReturn(id: ID!, notes: String, images: [String!], condition: String): MutationResponse!
    
    # Review mutations
    createReview(input: CreateReviewInput!): CreateReviewResponse!
    
    # Message mutations
    sendMessage(input: SendMessageInput!): SendMessageResponse!
    markMessageAsRead(id: ID!): MutationResponse!
    markConversationAsRead(id: ID!): MutationResponse!
    
    # Profile mutations
    updateProfile(input: UpdateProfileInput!): UpdateProfileResponse!
    
    # Favorite mutations
    addToFavorites(listing_id: ID!): MutationResponse!
    removeFromFavorites(listing_id: ID!): MutationResponse!
    
    # Notification mutations
    markNotificationAsRead(id: ID!): MutationResponse!
    markAllNotificationsAsRead: MutationResponse!
    
    # Admin mutations
    approveListing(id: ID!): MutationResponse!
    rejectListing(id: ID!, reason: String!): MutationResponse!
    adminReleasePayment(booking_id: ID!): MutationResponse!
  }

  # Root Subscription Type
  type Subscription {
    # Message subscriptions
    messageAdded(conversation_id: ID!): Message!
    conversationUpdated(user_id: ID!): Conversation!
    
    # Booking subscriptions
    bookingStatusChanged(user_id: ID!): Booking!
    
    # Notification subscriptions
    notificationAdded(user_id: ID!): Notification!
    
    # Listing subscriptions
    listingUpdated(listing_id: ID!): Listing!
  }
`;
