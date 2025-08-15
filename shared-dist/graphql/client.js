"use strict";
// GraphQL Client Utilities for Rent It Forward
// Shared utilities for Apollo Client configuration and GraphQL operations
Object.defineProperty(exports, "__esModule", { value: true });
exports.apolloClientConfig = exports.CACHE_KEYS = exports.SUBSCRIPTIONS = exports.MUTATIONS = exports.QUERIES = exports.FRAGMENTS = exports.OPERATION_NAMES = void 0;
exports.handleGraphQLError = handleGraphQLError;
exports.extractGraphQLErrors = extractGraphQLErrors;
exports.buildListingFilter = buildListingFilter;
exports.buildListingSort = buildListingSort;
exports.buildBookingFilter = buildBookingFilter;
exports.getCacheKey = getCacheKey;
// GraphQL Operation Names for consistency
exports.OPERATION_NAMES = {
    // Queries
    GET_ME: 'GetMe',
    GET_USER: 'GetUser',
    GET_LISTING: 'GetListing',
    GET_LISTINGS: 'GetListings',
    GET_BOOKING: 'GetBooking',
    GET_BOOKINGS: 'GetBookings',
    GET_CONVERSATION: 'GetConversation',
    GET_CONVERSATIONS: 'GetConversations',
    GET_MESSAGES: 'GetMessages',
    GET_CATEGORIES: 'GetCategories',
    GET_USER_DASHBOARD: 'GetUserDashboard',
    GET_ADMIN_DASHBOARD: 'GetAdminDashboard',
    GET_NOTIFICATIONS: 'GetNotifications',
    GET_FAVORITES: 'GetFavorites',
    SEARCH_LISTINGS: 'SearchListings',
    IS_FAVORITED: 'IsFavorited',
    // Mutations
    CREATE_LISTING: 'CreateListing',
    UPDATE_LISTING: 'UpdateListing',
    DELETE_LISTING: 'DeleteListing',
    CREATE_BOOKING: 'CreateBooking',
    CANCEL_BOOKING: 'CancelBooking',
    CONFIRM_BOOKING: 'ConfirmBooking',
    CONFIRM_PICKUP: 'ConfirmPickup',
    CONFIRM_RETURN: 'ConfirmReturn',
    CREATE_REVIEW: 'CreateReview',
    SEND_MESSAGE: 'SendMessage',
    MARK_MESSAGE_AS_READ: 'MarkMessageAsRead',
    MARK_CONVERSATION_AS_READ: 'MarkConversationAsRead',
    UPDATE_PROFILE: 'UpdateProfile',
    ADD_TO_FAVORITES: 'AddToFavorites',
    REMOVE_FROM_FAVORITES: 'RemoveFromFavorites',
    MARK_NOTIFICATION_AS_READ: 'MarkNotificationAsRead',
    MARK_ALL_NOTIFICATIONS_AS_READ: 'MarkAllNotificationsAsRead',
    APPROVE_LISTING: 'ApproveListing',
    REJECT_LISTING: 'RejectListing',
    ADMIN_RELEASE_PAYMENT: 'AdminReleasePayment',
    // Subscriptions
    MESSAGE_ADDED: 'MessageAdded',
    CONVERSATION_UPDATED: 'ConversationUpdated',
    BOOKING_STATUS_CHANGED: 'BookingStatusChanged',
    NOTIFICATION_ADDED: 'NotificationAdded',
    LISTING_UPDATED: 'ListingUpdated',
};
// GraphQL Fragments for reusable query parts
exports.FRAGMENTS = {
    USER_BASIC: `
    fragment UserBasic on User {
      id
      email
      full_name
      avatar_url
      rating
      total_reviews
      verified
      identity_verified
      created_at
    }
  `,
    USER_DETAILED: `
    fragment UserDetailed on User {
      id
      email
      full_name
      avatar_url
      phone_number
      bio
      location {
        coordinates
        address
        city
        state
        country
        postal_code
      }
      address
      city
      state
      country
      postal_code
      rating
      total_reviews
      verified
      points
      referral_code
      stripe_onboarded
      identity_verified
      role
      created_at
      updated_at
    }
  `,
    LISTING_BASIC: `
    fragment ListingBasic on Listing {
      id
      title
      description
      category
      price_per_day
      currency
      location {
        coordinates
        city
        state
        country
      }
      images
      condition
      rating
      review_count
      is_active
      created_at
    }
  `,
    LISTING_DETAILED: `
    fragment ListingDetailed on Listing {
      id
      title
      description
      category
      category_id
      price_per_day
      price_hourly
      price_weekly
      currency
      location {
        coordinates
        address
        city
        state
        country
        postal_code
      }
      address
      city
      state
      country
      postal_code
      images
      features
      condition
      brand
      model
      year
      deposit
      insurance_enabled
      delivery_available
      pickup_available
      is_active
      available_from
      available_to
      owner_id
      view_count
      favorite_count
      booking_count
      rating
      review_count
      approval_status
      approved_at
      created_at
      updated_at
      owner {
        ...UserBasic
      }
    }
  `,
    BOOKING_BASIC: `
    fragment BookingBasic on Booking {
      id
      listing_id
      start_date
      end_date
      total_days
      total_amount
      status
      payment_status
      created_at
    }
  `,
    BOOKING_DETAILED: `
    fragment BookingDetailed on Booking {
      id
      listing_id
      renter_id
      owner_id
      start_date
      end_date
      total_days
      price_per_day
      subtotal
      service_fee
      platform_fee
      insurance_fee
      deposit_amount
      total_amount
      delivery_method
      delivery_address
      status
      payment_status
      deposit_status
      payer_confirmed
      owner_confirmed
      pickup_confirmed_by_renter
      pickup_confirmed_by_owner
      pickup_confirmed_at
      return_confirmed_by_renter
      return_confirmed_by_owner
      return_confirmed_at
      renter_message
      owner_response
      pickup_location
      return_location
      condition_before
      condition_after
      has_issues
      payment_date
      created_at
      updated_at
      listing {
        ...ListingBasic
      }
      renter {
        ...UserBasic
      }
      owner {
        ...UserBasic
      }
      can_review
      can_cancel
      can_confirm_pickup
      can_confirm_return
    }
  `,
    MESSAGE_BASIC: `
    fragment MessageBasic on Message {
      id
      sender_id
      receiver_id
      content
      message_type
      is_read
      read_at
      created_at
      sender {
        ...UserBasic
      }
    }
  `,
    CONVERSATION_BASIC: `
    fragment ConversationBasic on Conversation {
      id
      participants
      booking_id
      listing_id
      last_message
      last_message_at
      created_at
      updated_at
      participants_info {
        ...UserBasic
      }
    }
  `,
};
// Common GraphQL Queries
exports.QUERIES = {
    GET_ME: `
    query GetMe {
      me {
        ...UserDetailed
      }
    }
    ${exports.FRAGMENTS.USER_DETAILED}
  `,
    GET_LISTINGS: `
    query GetListings($filter: ListingFilter, $sort: ListingSort, $first: Int, $after: String) {
      listings(filter: $filter, sort: $sort, first: $first, after: $after) {
        edges {
          node {
            ...ListingDetailed
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
    ${exports.FRAGMENTS.LISTING_DETAILED}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
    GET_LISTING: `
    query GetListing($id: ID!) {
      listing(id: $id) {
        ...ListingDetailed
        reviews(first: 10) {
          edges {
            node {
              id
              rating
              comment
              type
              created_at
              reviewer {
                ...UserBasic
              }
            }
          }
        }
        photos {
          id
          url
          thumbnail_url
          alt_text
          order_index
        }
      }
    }
    ${exports.FRAGMENTS.LISTING_DETAILED}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
    GET_BOOKINGS: `
    query GetBookings($filter: BookingFilter, $sort: BookingSort, $first: Int, $after: String) {
      bookings(filter: $filter, sort: $sort, first: $first, after: $after) {
        edges {
          node {
            ...BookingDetailed
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
    ${exports.FRAGMENTS.BOOKING_DETAILED}
    ${exports.FRAGMENTS.LISTING_BASIC}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
    GET_USER_DASHBOARD: `
    query GetUserDashboard($userId: ID!) {
      user_dashboard(user_id: $userId) {
        user {
          ...UserDetailed
        }
        stats {
          active_listings
          total_bookings_as_owner
          total_bookings_as_renter
          total_earnings
          pending_payouts
          unread_messages
          unread_notifications
        }
        recent_bookings {
          ...BookingBasic
          listing {
            ...ListingBasic
          }
          renter {
            ...UserBasic
          }
          owner {
            ...UserBasic
          }
        }
        recent_messages {
          ...MessageBasic
        }
        pending_reviews {
          ...BookingBasic
          listing {
            ...ListingBasic
          }
        }
      }
    }
    ${exports.FRAGMENTS.USER_DETAILED}
    ${exports.FRAGMENTS.USER_BASIC}
    ${exports.FRAGMENTS.BOOKING_BASIC}
    ${exports.FRAGMENTS.LISTING_BASIC}
    ${exports.FRAGMENTS.MESSAGE_BASIC}
  `,
    SEARCH_LISTINGS: `
    query SearchListings($input: SearchInput!) {
      search(input: $input) {
        listings {
          ...ListingDetailed
        }
        total_count
        facets {
          categories {
            name
            count
          }
          price_ranges {
            range
            count
          }
          conditions {
            name
            count
          }
          locations {
            city
            state
            count
          }
        }
      }
    }
    ${exports.FRAGMENTS.LISTING_DETAILED}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
    GET_CONVERSATIONS: `
    query GetConversations($userId: ID!, $first: Int, $after: String) {
      conversations(user_id: $userId, first: $first, after: $after) {
        edges {
          node {
            ...ConversationBasic
            unread_count(user_id: $userId)
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
    ${exports.FRAGMENTS.CONVERSATION_BASIC}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
    GET_MESSAGES: `
    query GetMessages($conversationId: ID!, $first: Int, $after: String) {
      messages(conversation_id: $conversationId, first: $first, after: $after) {
        edges {
          node {
            ...MessageBasic
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
    ${exports.FRAGMENTS.MESSAGE_BASIC}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
};
// Common GraphQL Mutations
exports.MUTATIONS = {
    CREATE_LISTING: `
    mutation CreateListing($input: CreateListingInput!) {
      createListing(input: $input) {
        success
        message
        errors
        listing {
          ...ListingDetailed
        }
      }
    }
    ${exports.FRAGMENTS.LISTING_DETAILED}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
    UPDATE_LISTING: `
    mutation UpdateListing($id: ID!, $input: UpdateListingInput!) {
      updateListing(id: $id, input: $input) {
        success
        message
        errors
        listing {
          ...ListingDetailed
        }
      }
    }
    ${exports.FRAGMENTS.LISTING_DETAILED}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
    CREATE_BOOKING: `
    mutation CreateBooking($input: CreateBookingInput!) {
      createBooking(input: $input) {
        success
        message
        errors
        booking {
          ...BookingDetailed
        }
      }
    }
    ${exports.FRAGMENTS.BOOKING_DETAILED}
    ${exports.FRAGMENTS.LISTING_BASIC}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
    SEND_MESSAGE: `
    mutation SendMessage($input: SendMessageInput!) {
      sendMessage(input: $input) {
        success
        message
        errors
        message_sent {
          ...MessageBasic
        }
      }
    }
    ${exports.FRAGMENTS.MESSAGE_BASIC}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
    ADD_TO_FAVORITES: `
    mutation AddToFavorites($listingId: ID!) {
      addToFavorites(listing_id: $listingId) {
        success
        message
        errors
      }
    }
  `,
    REMOVE_FROM_FAVORITES: `
    mutation RemoveFromFavorites($listingId: ID!) {
      removeFromFavorites(listing_id: $listingId) {
        success
        message
        errors
      }
    }
  `,
};
// Common GraphQL Subscriptions
exports.SUBSCRIPTIONS = {
    MESSAGE_ADDED: `
    subscription MessageAdded($conversationId: ID!) {
      messageAdded(conversation_id: $conversationId) {
        ...MessageBasic
      }
    }
    ${exports.FRAGMENTS.MESSAGE_BASIC}
    ${exports.FRAGMENTS.USER_BASIC}
  `,
    BOOKING_STATUS_CHANGED: `
    subscription BookingStatusChanged($userId: ID!) {
      bookingStatusChanged(user_id: $userId) {
        ...BookingBasic
        listing {
          ...ListingBasic
        }
      }
    }
    ${exports.FRAGMENTS.BOOKING_BASIC}
    ${exports.FRAGMENTS.LISTING_BASIC}
  `,
    NOTIFICATION_ADDED: `
    subscription NotificationAdded($userId: ID!) {
      notificationAdded(user_id: $userId) {
        id
        title
        message
        type
        related_id
        is_read
        created_at
      }
    }
  `,
};
function handleGraphQLError(error) {
    // Extract meaningful error messages
    if (error.extensions?.code) {
        switch (error.extensions.code) {
            case 'UNAUTHENTICATED':
                return 'Please log in to continue';
            case 'FORBIDDEN':
                return 'You do not have permission to perform this action';
            case 'NOT_FOUND':
                return 'The requested resource was not found';
            case 'VALIDATION_ERROR':
                return error.message || 'Invalid input provided';
            case 'RATE_LIMITED':
                return 'Too many requests. Please try again later';
            default:
                return error.message || 'An unexpected error occurred';
        }
    }
    return error.message || 'An unexpected error occurred';
}
function extractGraphQLErrors(errors) {
    return errors.map(handleGraphQLError);
}
// Query Variable Builders
function buildListingFilter(params) {
    const filter = {};
    if (params.search)
        filter.search = params.search;
    if (params.category)
        filter.category = params.category;
    if (params.minPrice !== undefined)
        filter.min_price = params.minPrice;
    if (params.maxPrice !== undefined)
        filter.max_price = params.maxPrice;
    if (params.location)
        filter.city = params.location;
    if (params.condition?.length)
        filter.condition = params.condition;
    if (params.deliveryAvailable !== undefined)
        filter.delivery_available = params.deliveryAvailable;
    if (params.insuranceEnabled !== undefined)
        filter.insurance_enabled = params.insuranceEnabled;
    return filter;
}
function buildListingSort(sortBy = 'created_at', direction = 'DESC') {
    return {
        field: sortBy,
        direction,
    };
}
function buildBookingFilter(params) {
    const filter = {};
    if (params.status?.length)
        filter.status = params.status;
    if (params.renterId)
        filter.renter_id = params.renterId;
    if (params.ownerId)
        filter.owner_id = params.ownerId;
    if (params.listingId)
        filter.listing_id = params.listingId;
    return filter;
}
// Cache Utilities
exports.CACHE_KEYS = {
    LISTINGS: 'listings',
    LISTING: 'listing',
    BOOKINGS: 'bookings',
    BOOKING: 'booking',
    USER_DASHBOARD: 'userDashboard',
    CONVERSATIONS: 'conversations',
    MESSAGES: 'messages',
    CATEGORIES: 'categories',
    NOTIFICATIONS: 'notifications',
    FAVORITES: 'favorites',
};
function getCacheKey(type, id) {
    return id ? `${exports.CACHE_KEYS[type]}:${id}` : exports.CACHE_KEYS[type];
}
// Apollo Client Configuration Helpers
exports.apolloClientConfig = {
    // Default cache policies
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
            fetchPolicy: 'cache-and-network',
        },
        query: {
            errorPolicy: 'all',
            fetchPolicy: 'cache-first',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
    // Type policies for cache normalization
    typePolicies: {
        User: {
            fields: {
                listings: {
                    merge(existing = { edges: [] }, incoming) {
                        return {
                            ...incoming,
                            edges: [...existing.edges, ...incoming.edges],
                        };
                    },
                },
                notifications: {
                    merge(existing = { edges: [] }, incoming) {
                        return {
                            ...incoming,
                            edges: [...existing.edges, ...incoming.edges],
                        };
                    },
                },
            },
        },
        Listing: {
            fields: {
                reviews: {
                    merge(existing = { edges: [] }, incoming) {
                        return {
                            ...incoming,
                            edges: [...existing.edges, ...incoming.edges],
                        };
                    },
                },
            },
        },
        Conversation: {
            fields: {
                messages: {
                    merge(existing = { edges: [] }, incoming) {
                        return {
                            ...incoming,
                            edges: [...existing.edges, ...incoming.edges],
                        };
                    },
                },
            },
        },
    },
};
