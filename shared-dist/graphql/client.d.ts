import type { ListingFilter, ListingSort, BookingFilter } from './types';
export declare const OPERATION_NAMES: {
    readonly GET_ME: "GetMe";
    readonly GET_USER: "GetUser";
    readonly GET_LISTING: "GetListing";
    readonly GET_LISTINGS: "GetListings";
    readonly GET_BOOKING: "GetBooking";
    readonly GET_BOOKINGS: "GetBookings";
    readonly GET_CONVERSATION: "GetConversation";
    readonly GET_CONVERSATIONS: "GetConversations";
    readonly GET_MESSAGES: "GetMessages";
    readonly GET_CATEGORIES: "GetCategories";
    readonly GET_USER_DASHBOARD: "GetUserDashboard";
    readonly GET_ADMIN_DASHBOARD: "GetAdminDashboard";
    readonly GET_NOTIFICATIONS: "GetNotifications";
    readonly GET_FAVORITES: "GetFavorites";
    readonly SEARCH_LISTINGS: "SearchListings";
    readonly IS_FAVORITED: "IsFavorited";
    readonly CREATE_LISTING: "CreateListing";
    readonly UPDATE_LISTING: "UpdateListing";
    readonly DELETE_LISTING: "DeleteListing";
    readonly CREATE_BOOKING: "CreateBooking";
    readonly CANCEL_BOOKING: "CancelBooking";
    readonly CONFIRM_BOOKING: "ConfirmBooking";
    readonly CONFIRM_PICKUP: "ConfirmPickup";
    readonly CONFIRM_RETURN: "ConfirmReturn";
    readonly CREATE_REVIEW: "CreateReview";
    readonly SEND_MESSAGE: "SendMessage";
    readonly MARK_MESSAGE_AS_READ: "MarkMessageAsRead";
    readonly MARK_CONVERSATION_AS_READ: "MarkConversationAsRead";
    readonly UPDATE_PROFILE: "UpdateProfile";
    readonly ADD_TO_FAVORITES: "AddToFavorites";
    readonly REMOVE_FROM_FAVORITES: "RemoveFromFavorites";
    readonly MARK_NOTIFICATION_AS_READ: "MarkNotificationAsRead";
    readonly MARK_ALL_NOTIFICATIONS_AS_READ: "MarkAllNotificationsAsRead";
    readonly APPROVE_LISTING: "ApproveListing";
    readonly REJECT_LISTING: "RejectListing";
    readonly ADMIN_RELEASE_PAYMENT: "AdminReleasePayment";
    readonly MESSAGE_ADDED: "MessageAdded";
    readonly CONVERSATION_UPDATED: "ConversationUpdated";
    readonly BOOKING_STATUS_CHANGED: "BookingStatusChanged";
    readonly NOTIFICATION_ADDED: "NotificationAdded";
    readonly LISTING_UPDATED: "ListingUpdated";
};
export declare const FRAGMENTS: {
    readonly USER_BASIC: "\n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  ";
    readonly USER_DETAILED: "\n    fragment UserDetailed on User {\n      id\n      email\n      full_name\n      avatar_url\n      phone_number\n      bio\n      location {\n        coordinates\n        address\n        city\n        state\n        country\n        postal_code\n      }\n      address\n      city\n      state\n      country\n      postal_code\n      rating\n      total_reviews\n      verified\n      points\n      referral_code\n      stripe_onboarded\n      identity_verified\n      role\n      created_at\n      updated_at\n    }\n  ";
    readonly LISTING_BASIC: "\n    fragment ListingBasic on Listing {\n      id\n      title\n      description\n      category\n      price_per_day\n      currency\n      location {\n        coordinates\n        city\n        state\n        country\n      }\n      images\n      condition\n      rating\n      review_count\n      is_active\n      created_at\n    }\n  ";
    readonly LISTING_DETAILED: "\n    fragment ListingDetailed on Listing {\n      id\n      title\n      description\n      category\n      category_id\n      price_per_day\n      price_hourly\n      price_weekly\n      currency\n      location {\n        coordinates\n        address\n        city\n        state\n        country\n        postal_code\n      }\n      address\n      city\n      state\n      country\n      postal_code\n      images\n      features\n      condition\n      brand\n      model\n      year\n      deposit\n      insurance_enabled\n      delivery_available\n      pickup_available\n      is_active\n      available_from\n      available_to\n      owner_id\n      view_count\n      favorite_count\n      booking_count\n      rating\n      review_count\n      approval_status\n      approved_at\n      created_at\n      updated_at\n      owner {\n        ...UserBasic\n      }\n    }\n  ";
    readonly BOOKING_BASIC: "\n    fragment BookingBasic on Booking {\n      id\n      listing_id\n      start_date\n      end_date\n      total_days\n      total_amount\n      status\n      payment_status\n      created_at\n    }\n  ";
    readonly BOOKING_DETAILED: "\n    fragment BookingDetailed on Booking {\n      id\n      listing_id\n      renter_id\n      owner_id\n      start_date\n      end_date\n      total_days\n      price_per_day\n      subtotal\n      service_fee\n      platform_fee\n      insurance_fee\n      deposit_amount\n      total_amount\n      delivery_method\n      delivery_address\n      status\n      payment_status\n      deposit_status\n      payer_confirmed\n      owner_confirmed\n      pickup_confirmed_by_renter\n      pickup_confirmed_by_owner\n      pickup_confirmed_at\n      return_confirmed_by_renter\n      return_confirmed_by_owner\n      return_confirmed_at\n      renter_message\n      owner_response\n      pickup_location\n      return_location\n      condition_before\n      condition_after\n      has_issues\n      payment_date\n      created_at\n      updated_at\n      listing {\n        ...ListingBasic\n      }\n      renter {\n        ...UserBasic\n      }\n      owner {\n        ...UserBasic\n      }\n      can_review\n      can_cancel\n      can_confirm_pickup\n      can_confirm_return\n    }\n  ";
    readonly MESSAGE_BASIC: "\n    fragment MessageBasic on Message {\n      id\n      sender_id\n      receiver_id\n      content\n      message_type\n      is_read\n      read_at\n      created_at\n      sender {\n        ...UserBasic\n      }\n    }\n  ";
    readonly CONVERSATION_BASIC: "\n    fragment ConversationBasic on Conversation {\n      id\n      participants\n      booking_id\n      listing_id\n      last_message\n      last_message_at\n      created_at\n      updated_at\n      participants_info {\n        ...UserBasic\n      }\n    }\n  ";
};
export declare const QUERIES: {
    readonly GET_ME: "\n    query GetMe {\n      me {\n        ...UserDetailed\n      }\n    }\n    \n    fragment UserDetailed on User {\n      id\n      email\n      full_name\n      avatar_url\n      phone_number\n      bio\n      location {\n        coordinates\n        address\n        city\n        state\n        country\n        postal_code\n      }\n      address\n      city\n      state\n      country\n      postal_code\n      rating\n      total_reviews\n      verified\n      points\n      referral_code\n      stripe_onboarded\n      identity_verified\n      role\n      created_at\n      updated_at\n    }\n  \n  ";
    readonly GET_LISTINGS: "\n    query GetListings($filter: ListingFilter, $sort: ListingSort, $first: Int, $after: String) {\n      listings(filter: $filter, sort: $sort, first: $first, after: $after) {\n        edges {\n          node {\n            ...ListingDetailed\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n        totalCount\n      }\n    }\n    \n    fragment ListingDetailed on Listing {\n      id\n      title\n      description\n      category\n      category_id\n      price_per_day\n      price_hourly\n      price_weekly\n      currency\n      location {\n        coordinates\n        address\n        city\n        state\n        country\n        postal_code\n      }\n      address\n      city\n      state\n      country\n      postal_code\n      images\n      features\n      condition\n      brand\n      model\n      year\n      deposit\n      insurance_enabled\n      delivery_available\n      pickup_available\n      is_active\n      available_from\n      available_to\n      owner_id\n      view_count\n      favorite_count\n      booking_count\n      rating\n      review_count\n      approval_status\n      approved_at\n      created_at\n      updated_at\n      owner {\n        ...UserBasic\n      }\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
    readonly GET_LISTING: "\n    query GetListing($id: ID!) {\n      listing(id: $id) {\n        ...ListingDetailed\n        reviews(first: 10) {\n          edges {\n            node {\n              id\n              rating\n              comment\n              type\n              created_at\n              reviewer {\n                ...UserBasic\n              }\n            }\n          }\n        }\n        photos {\n          id\n          url\n          thumbnail_url\n          alt_text\n          order_index\n        }\n      }\n    }\n    \n    fragment ListingDetailed on Listing {\n      id\n      title\n      description\n      category\n      category_id\n      price_per_day\n      price_hourly\n      price_weekly\n      currency\n      location {\n        coordinates\n        address\n        city\n        state\n        country\n        postal_code\n      }\n      address\n      city\n      state\n      country\n      postal_code\n      images\n      features\n      condition\n      brand\n      model\n      year\n      deposit\n      insurance_enabled\n      delivery_available\n      pickup_available\n      is_active\n      available_from\n      available_to\n      owner_id\n      view_count\n      favorite_count\n      booking_count\n      rating\n      review_count\n      approval_status\n      approved_at\n      created_at\n      updated_at\n      owner {\n        ...UserBasic\n      }\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
    readonly GET_BOOKINGS: "\n    query GetBookings($filter: BookingFilter, $sort: BookingSort, $first: Int, $after: String) {\n      bookings(filter: $filter, sort: $sort, first: $first, after: $after) {\n        edges {\n          node {\n            ...BookingDetailed\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n        totalCount\n      }\n    }\n    \n    fragment BookingDetailed on Booking {\n      id\n      listing_id\n      renter_id\n      owner_id\n      start_date\n      end_date\n      total_days\n      price_per_day\n      subtotal\n      service_fee\n      platform_fee\n      insurance_fee\n      deposit_amount\n      total_amount\n      delivery_method\n      delivery_address\n      status\n      payment_status\n      deposit_status\n      payer_confirmed\n      owner_confirmed\n      pickup_confirmed_by_renter\n      pickup_confirmed_by_owner\n      pickup_confirmed_at\n      return_confirmed_by_renter\n      return_confirmed_by_owner\n      return_confirmed_at\n      renter_message\n      owner_response\n      pickup_location\n      return_location\n      condition_before\n      condition_after\n      has_issues\n      payment_date\n      created_at\n      updated_at\n      listing {\n        ...ListingBasic\n      }\n      renter {\n        ...UserBasic\n      }\n      owner {\n        ...UserBasic\n      }\n      can_review\n      can_cancel\n      can_confirm_pickup\n      can_confirm_return\n    }\n  \n    \n    fragment ListingBasic on Listing {\n      id\n      title\n      description\n      category\n      price_per_day\n      currency\n      location {\n        coordinates\n        city\n        state\n        country\n      }\n      images\n      condition\n      rating\n      review_count\n      is_active\n      created_at\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
    readonly GET_USER_DASHBOARD: "\n    query GetUserDashboard($userId: ID!) {\n      user_dashboard(user_id: $userId) {\n        user {\n          ...UserDetailed\n        }\n        stats {\n          active_listings\n          total_bookings_as_owner\n          total_bookings_as_renter\n          total_earnings\n          pending_payouts\n          unread_messages\n          unread_notifications\n        }\n        recent_bookings {\n          ...BookingBasic\n          listing {\n            ...ListingBasic\n          }\n          renter {\n            ...UserBasic\n          }\n          owner {\n            ...UserBasic\n          }\n        }\n        recent_messages {\n          ...MessageBasic\n        }\n        pending_reviews {\n          ...BookingBasic\n          listing {\n            ...ListingBasic\n          }\n        }\n      }\n    }\n    \n    fragment UserDetailed on User {\n      id\n      email\n      full_name\n      avatar_url\n      phone_number\n      bio\n      location {\n        coordinates\n        address\n        city\n        state\n        country\n        postal_code\n      }\n      address\n      city\n      state\n      country\n      postal_code\n      rating\n      total_reviews\n      verified\n      points\n      referral_code\n      stripe_onboarded\n      identity_verified\n      role\n      created_at\n      updated_at\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n    \n    fragment BookingBasic on Booking {\n      id\n      listing_id\n      start_date\n      end_date\n      total_days\n      total_amount\n      status\n      payment_status\n      created_at\n    }\n  \n    \n    fragment ListingBasic on Listing {\n      id\n      title\n      description\n      category\n      price_per_day\n      currency\n      location {\n        coordinates\n        city\n        state\n        country\n      }\n      images\n      condition\n      rating\n      review_count\n      is_active\n      created_at\n    }\n  \n    \n    fragment MessageBasic on Message {\n      id\n      sender_id\n      receiver_id\n      content\n      message_type\n      is_read\n      read_at\n      created_at\n      sender {\n        ...UserBasic\n      }\n    }\n  \n  ";
    readonly SEARCH_LISTINGS: "\n    query SearchListings($input: SearchInput!) {\n      search(input: $input) {\n        listings {\n          ...ListingDetailed\n        }\n        total_count\n        facets {\n          categories {\n            name\n            count\n          }\n          price_ranges {\n            range\n            count\n          }\n          conditions {\n            name\n            count\n          }\n          locations {\n            city\n            state\n            count\n          }\n        }\n      }\n    }\n    \n    fragment ListingDetailed on Listing {\n      id\n      title\n      description\n      category\n      category_id\n      price_per_day\n      price_hourly\n      price_weekly\n      currency\n      location {\n        coordinates\n        address\n        city\n        state\n        country\n        postal_code\n      }\n      address\n      city\n      state\n      country\n      postal_code\n      images\n      features\n      condition\n      brand\n      model\n      year\n      deposit\n      insurance_enabled\n      delivery_available\n      pickup_available\n      is_active\n      available_from\n      available_to\n      owner_id\n      view_count\n      favorite_count\n      booking_count\n      rating\n      review_count\n      approval_status\n      approved_at\n      created_at\n      updated_at\n      owner {\n        ...UserBasic\n      }\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
    readonly GET_CONVERSATIONS: "\n    query GetConversations($userId: ID!, $first: Int, $after: String) {\n      conversations(user_id: $userId, first: $first, after: $after) {\n        edges {\n          node {\n            ...ConversationBasic\n            unread_count(user_id: $userId)\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n        totalCount\n      }\n    }\n    \n    fragment ConversationBasic on Conversation {\n      id\n      participants\n      booking_id\n      listing_id\n      last_message\n      last_message_at\n      created_at\n      updated_at\n      participants_info {\n        ...UserBasic\n      }\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
    readonly GET_MESSAGES: "\n    query GetMessages($conversationId: ID!, $first: Int, $after: String) {\n      messages(conversation_id: $conversationId, first: $first, after: $after) {\n        edges {\n          node {\n            ...MessageBasic\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n        totalCount\n      }\n    }\n    \n    fragment MessageBasic on Message {\n      id\n      sender_id\n      receiver_id\n      content\n      message_type\n      is_read\n      read_at\n      created_at\n      sender {\n        ...UserBasic\n      }\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
};
export declare const MUTATIONS: {
    readonly CREATE_LISTING: "\n    mutation CreateListing($input: CreateListingInput!) {\n      createListing(input: $input) {\n        success\n        message\n        errors\n        listing {\n          ...ListingDetailed\n        }\n      }\n    }\n    \n    fragment ListingDetailed on Listing {\n      id\n      title\n      description\n      category\n      category_id\n      price_per_day\n      price_hourly\n      price_weekly\n      currency\n      location {\n        coordinates\n        address\n        city\n        state\n        country\n        postal_code\n      }\n      address\n      city\n      state\n      country\n      postal_code\n      images\n      features\n      condition\n      brand\n      model\n      year\n      deposit\n      insurance_enabled\n      delivery_available\n      pickup_available\n      is_active\n      available_from\n      available_to\n      owner_id\n      view_count\n      favorite_count\n      booking_count\n      rating\n      review_count\n      approval_status\n      approved_at\n      created_at\n      updated_at\n      owner {\n        ...UserBasic\n      }\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
    readonly UPDATE_LISTING: "\n    mutation UpdateListing($id: ID!, $input: UpdateListingInput!) {\n      updateListing(id: $id, input: $input) {\n        success\n        message\n        errors\n        listing {\n          ...ListingDetailed\n        }\n      }\n    }\n    \n    fragment ListingDetailed on Listing {\n      id\n      title\n      description\n      category\n      category_id\n      price_per_day\n      price_hourly\n      price_weekly\n      currency\n      location {\n        coordinates\n        address\n        city\n        state\n        country\n        postal_code\n      }\n      address\n      city\n      state\n      country\n      postal_code\n      images\n      features\n      condition\n      brand\n      model\n      year\n      deposit\n      insurance_enabled\n      delivery_available\n      pickup_available\n      is_active\n      available_from\n      available_to\n      owner_id\n      view_count\n      favorite_count\n      booking_count\n      rating\n      review_count\n      approval_status\n      approved_at\n      created_at\n      updated_at\n      owner {\n        ...UserBasic\n      }\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
    readonly CREATE_BOOKING: "\n    mutation CreateBooking($input: CreateBookingInput!) {\n      createBooking(input: $input) {\n        success\n        message\n        errors\n        booking {\n          ...BookingDetailed\n        }\n      }\n    }\n    \n    fragment BookingDetailed on Booking {\n      id\n      listing_id\n      renter_id\n      owner_id\n      start_date\n      end_date\n      total_days\n      price_per_day\n      subtotal\n      service_fee\n      platform_fee\n      insurance_fee\n      deposit_amount\n      total_amount\n      delivery_method\n      delivery_address\n      status\n      payment_status\n      deposit_status\n      payer_confirmed\n      owner_confirmed\n      pickup_confirmed_by_renter\n      pickup_confirmed_by_owner\n      pickup_confirmed_at\n      return_confirmed_by_renter\n      return_confirmed_by_owner\n      return_confirmed_at\n      renter_message\n      owner_response\n      pickup_location\n      return_location\n      condition_before\n      condition_after\n      has_issues\n      payment_date\n      created_at\n      updated_at\n      listing {\n        ...ListingBasic\n      }\n      renter {\n        ...UserBasic\n      }\n      owner {\n        ...UserBasic\n      }\n      can_review\n      can_cancel\n      can_confirm_pickup\n      can_confirm_return\n    }\n  \n    \n    fragment ListingBasic on Listing {\n      id\n      title\n      description\n      category\n      price_per_day\n      currency\n      location {\n        coordinates\n        city\n        state\n        country\n      }\n      images\n      condition\n      rating\n      review_count\n      is_active\n      created_at\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
    readonly SEND_MESSAGE: "\n    mutation SendMessage($input: SendMessageInput!) {\n      sendMessage(input: $input) {\n        success\n        message\n        errors\n        message_sent {\n          ...MessageBasic\n        }\n      }\n    }\n    \n    fragment MessageBasic on Message {\n      id\n      sender_id\n      receiver_id\n      content\n      message_type\n      is_read\n      read_at\n      created_at\n      sender {\n        ...UserBasic\n      }\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
    readonly ADD_TO_FAVORITES: "\n    mutation AddToFavorites($listingId: ID!) {\n      addToFavorites(listing_id: $listingId) {\n        success\n        message\n        errors\n      }\n    }\n  ";
    readonly REMOVE_FROM_FAVORITES: "\n    mutation RemoveFromFavorites($listingId: ID!) {\n      removeFromFavorites(listing_id: $listingId) {\n        success\n        message\n        errors\n      }\n    }\n  ";
};
export declare const SUBSCRIPTIONS: {
    readonly MESSAGE_ADDED: "\n    subscription MessageAdded($conversationId: ID!) {\n      messageAdded(conversation_id: $conversationId) {\n        ...MessageBasic\n      }\n    }\n    \n    fragment MessageBasic on Message {\n      id\n      sender_id\n      receiver_id\n      content\n      message_type\n      is_read\n      read_at\n      created_at\n      sender {\n        ...UserBasic\n      }\n    }\n  \n    \n    fragment UserBasic on User {\n      id\n      email\n      full_name\n      avatar_url\n      rating\n      total_reviews\n      verified\n      identity_verified\n      created_at\n    }\n  \n  ";
    readonly BOOKING_STATUS_CHANGED: "\n    subscription BookingStatusChanged($userId: ID!) {\n      bookingStatusChanged(user_id: $userId) {\n        ...BookingBasic\n        listing {\n          ...ListingBasic\n        }\n      }\n    }\n    \n    fragment BookingBasic on Booking {\n      id\n      listing_id\n      start_date\n      end_date\n      total_days\n      total_amount\n      status\n      payment_status\n      created_at\n    }\n  \n    \n    fragment ListingBasic on Listing {\n      id\n      title\n      description\n      category\n      price_per_day\n      currency\n      location {\n        coordinates\n        city\n        state\n        country\n      }\n      images\n      condition\n      rating\n      review_count\n      is_active\n      created_at\n    }\n  \n  ";
    readonly NOTIFICATION_ADDED: "\n    subscription NotificationAdded($userId: ID!) {\n      notificationAdded(user_id: $userId) {\n        id\n        title\n        message\n        type\n        related_id\n        is_read\n        created_at\n      }\n    }\n  ";
};
export interface GraphQLFormattedError {
    message: string;
    locations?: Array<{
        line: number;
        column: number;
    }>;
    path?: Array<string | number>;
    extensions?: {
        code?: string;
        exception?: {
            stacktrace?: string[];
        };
    };
}
export declare function handleGraphQLError(error: GraphQLFormattedError): string;
export declare function extractGraphQLErrors(errors: GraphQLFormattedError[]): string[];
export declare function buildListingFilter(params: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    condition?: string[];
    deliveryAvailable?: boolean;
    insuranceEnabled?: boolean;
}): ListingFilter;
export declare function buildListingSort(sortBy?: string, direction?: 'ASC' | 'DESC'): ListingSort;
export declare function buildBookingFilter(params: {
    status?: string[];
    renterId?: string;
    ownerId?: string;
    listingId?: string;
}): BookingFilter;
export declare const CACHE_KEYS: {
    readonly LISTINGS: "listings";
    readonly LISTING: "listing";
    readonly BOOKINGS: "bookings";
    readonly BOOKING: "booking";
    readonly USER_DASHBOARD: "userDashboard";
    readonly CONVERSATIONS: "conversations";
    readonly MESSAGES: "messages";
    readonly CATEGORIES: "categories";
    readonly NOTIFICATIONS: "notifications";
    readonly FAVORITES: "favorites";
};
export declare function getCacheKey(type: keyof typeof CACHE_KEYS, id?: string): string;
export declare const apolloClientConfig: {
    readonly defaultOptions: {
        readonly watchQuery: {
            readonly errorPolicy: "all";
            readonly fetchPolicy: "cache-and-network";
        };
        readonly query: {
            readonly errorPolicy: "all";
            readonly fetchPolicy: "cache-first";
        };
        readonly mutate: {
            readonly errorPolicy: "all";
        };
    };
    readonly typePolicies: {
        readonly User: {
            readonly fields: {
                readonly listings: {
                    readonly merge: (existing: {
                        edges: never[];
                    } | undefined, incoming: any) => any;
                };
                readonly notifications: {
                    readonly merge: (existing: {
                        edges: never[];
                    } | undefined, incoming: any) => any;
                };
            };
        };
        readonly Listing: {
            readonly fields: {
                readonly reviews: {
                    readonly merge: (existing: {
                        edges: never[];
                    } | undefined, incoming: any) => any;
                };
            };
        };
        readonly Conversation: {
            readonly fields: {
                readonly messages: {
                    readonly merge: (existing: {
                        edges: never[];
                    } | undefined, incoming: any) => any;
                };
            };
        };
    };
};
