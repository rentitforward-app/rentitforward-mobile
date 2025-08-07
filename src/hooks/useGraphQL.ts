import { useQuery, useMutation, gql } from '@apollo/client';
// import { QUERIES, MUTATIONS } from '@rentitforward/shared/graphql'; // Temporarily disabled for deployment
// import type { 
//   GraphQLUser, 
//   GraphQLListing, 
//   GraphQLBooking 
// } from '@rentitforward/shared/graphql'; // Temporarily disabled for deployment

// Temporary QUERIES object for quick deployment
const QUERIES = {
  GET_ME: `
    query GetMe {
      me {
        id
        email
        full_name
        avatar_url
        phone_number
        bio
        rating
        total_reviews
        verified
        created_at
        updated_at
      }
    }
  `,
  GET_LISTING: `
    query GetListing($id: ID!) {
      listing(id: $id) {
        id
        title
        description
        price_per_day
        currency
        category
        owner_id
        images
        location {
          city
          state
          country
        }
        owner {
          id
          full_name
          avatar_url
          rating
        }
        created_at
      }
    }
  `,
  GET_LISTINGS: `
    query GetListings($first: Int, $after: String) {
      listings(first: $first, after: $after) {
        edges {
          node {
            id
            title
            description
            price_per_day
            images
            location {
              city
              state
            }
            owner {
              id
              full_name
              avatar_url
              rating
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  GET_BOOKINGS: `
    query GetBookings {
      bookings {
        edges {
          node {
            id
            listing_id
            renter_id
            start_date
            end_date
            total_price
            status
            created_at
          }
        }
      }
    }
  `
};

// Temporary type definitions for quick deployment
type GraphQLUser = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  bio?: string;
  rating?: number;
  total_reviews?: number;
  verified?: boolean;
  created_at: string;
  updated_at: string;
};

type GraphQLListing = {
  id: string;
  title: string;
  description: string;
  price_per_day: number;
  currency: string;
  category: string;
  owner_id: string;
  images: string[];
  location: any;
  owner: GraphQLUser;
  created_at: string;
};

type GraphQLBooking = {
  id: string;
  listing_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
};

// User Hooks
export function useCurrentUser() {
  const { data, loading, error, refetch } = useQuery(gql(QUERIES.GET_ME), {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    // Mobile-optimized settings
    fetchPolicy: 'cache-first',
  });

  return {
    user: data?.me as GraphQLUser | null,
    loading,
    error,
    refetch,
  };
}

export function useUser(userId: string) {
  const { data, loading, error } = useQuery(gql`
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        email
        full_name
        avatar_url
        phone_number
        bio
        rating
        total_reviews
        verified
        created_at
        updated_at
      }
    }
  `, {
    variables: { id: userId },
    skip: !userId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
  });

  return {
    user: data?.user as GraphQLUser | null,
    loading,
    error,
  };
}

// Listing Hooks with mobile-optimized loading
export function useListing(listingId: string) {
  const { data, loading, error, refetch } = useQuery(gql(QUERIES.GET_LISTING), {
    variables: { id: listingId },
    skip: !listingId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    // Preload data for better mobile experience
    notifyOnNetworkStatusChange: true,
  });

  return {
    listing: data?.listing as GraphQLListing | null,
    loading,
    error,
    refetch,
  };
}

export function useListings(limit = 20) {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(gql(QUERIES.GET_LISTINGS), {
    variables: { first: limit },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  const loadMore = () => {
    if (data?.listings?.pageInfo?.hasNextPage && !loading) {
      return fetchMore({
        variables: {
          first: limit,
          after: data.listings.pageInfo.endCursor,
        },
      });
    }
  };

  return {
    listings: data?.listings?.edges?.map((edge: any) => edge.node) || [],
    connection: data?.listings,
    loading,
    error,
    loadMore,
    hasMore: data?.listings?.pageInfo?.hasNextPage || false,
    refreshing: networkStatus === 4, // Refetch loading state
  };
}

// Featured listings for home screen
export function useFeaturedListings(limit = 6) {
  const { data, loading, error } = useQuery(gql`
    query GetFeaturedListings($limit: Int) {
      featured_listings(limit: $limit) {
        id
        title
        description
        price_per_day
        images
        location {
          city
          state
        }
        owner {
          id
          full_name
          avatar_url
          rating
        }
      }
    }
  `, {
    variables: { limit },
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
  });

  return {
    listings: data?.featured_listings || [],
    loading,
    error,
  };
}

// Booking Hooks
export function useUserBookings() {
  const { data, loading, error, refetch } = useQuery(gql(QUERIES.GET_BOOKINGS), {
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  return {
    bookings: data?.bookings?.edges?.map((edge: any) => edge.node) || [],
    connection: data?.bookings,
    loading,
    error,
    refetch,
  };
}

// Search functionality with debouncing
export function useSearch(query: string, filters?: any) {
  const { data, loading, error } = useQuery(gql`
    query SearchListings($input: SearchInput!) {
      search(input: $input) {
        listings {
          edges {
            node {
              id
              title
              description
              price_per_day
              images
              location {
                city
                state
              }
              owner {
                id
                full_name
                avatar_url
                rating
              }
            }
          }
        }
        total_count
      }
    }
  `, {
    variables: { 
      input: { 
        query, 
        ...filters 
      } 
    },
    skip: !query || query.length < 2,
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
  });

  return {
    results: data?.search?.listings?.edges?.map((edge: any) => edge.node) || [],
    totalCount: data?.search?.total_count || 0,
    loading,
    error,
  };
}

// Mutation Hooks with mobile optimizations
export function useCreateListing() {
  const [createListing, { data, loading, error }] = useMutation(gql`
    mutation CreateListing($input: CreateListingInput!) {
      createListing(input: $input) {
        success
        message
        listing {
          id
          title
          description
          price_per_day
          currency
          category
          owner_id
          created_at
        }
      }
    }
  `, {
    // Optimistically update the cache
    update: (cache, { data }) => {
      if (data?.createListing?.success) {
        // Invalidate listings cache to refetch
        cache.evict({ fieldName: 'listings' });
        cache.gc();
      }
    },
  });

  const mutate = async (input: any) => {
    try {
      const result = await createListing({
        variables: { input },
      });
      return result.data?.createListing;
    } catch (err) {
      throw err;
    }
  };

  return {
    createListing: mutate,
    data: data?.createListing,
    loading,
    error,
  };
}

export function useCreateBooking() {
  const [createBooking, { data, loading, error }] = useMutation(gql`
    mutation CreateBooking($input: CreateBookingInput!) {
      createBooking(input: $input) {
        success
        message
        booking {
          id
          listing_id
          renter_id
          start_date
          end_date
          total_price
          status
          created_at
        }
      }
    }
  `, {
    update: (cache, { data }) => {
      if (data?.createBooking?.success) {
        // Invalidate bookings cache to refetch
        cache.evict({ fieldName: 'bookings' });
        cache.gc();
      }
    },
  });

  const mutate = async (input: any) => {
    try {
      const result = await createBooking({
        variables: { input },
      });
      return result.data?.createBooking;
    } catch (err) {
      throw err;
    }
  };

  return {
    createBooking: mutate,
    data: data?.createBooking,
    loading,
    error,
  };
}

export function useSendMessage() {
  const [sendMessage, { data, loading, error }] = useMutation(gql`
    mutation SendMessage($input: SendMessageInput!) {
      sendMessage(input: $input) {
        success
        message
        sentMessage {
          id
          content
          sender_id
          conversation_id
          created_at
          message_type
        }
      }
    }
  `, {
    update: (cache, { data }) => {
      if (data?.sendMessage?.success) {
        // Invalidate messages cache to refetch
        cache.evict({ fieldName: 'messages' });
        cache.gc();
      }
    },
  });

  const mutate = async (input: any) => {
    try {
      const result = await sendMessage({
        variables: { input },
      });
      return result.data?.sendMessage;
    } catch (err) {
      throw err;
    }
  };

  return {
    sendMessage: mutate,
    data: data?.sendMessage,
    loading,
    error,
  };
}

// Helper hook for handling authentication state
export function useAuthenticatedQuery<T>(
  query: any,
  options: any = {}
) {
  const { user } = useCurrentUser();
  
  return useQuery(query, {
    ...options,
    skip: options.skip || !user,
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
  });
} 