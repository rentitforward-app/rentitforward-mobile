import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { QUERIES, MUTATIONS } from 'rentitforward-shared/src/graphql';

// HTTP Link for GraphQL endpoint
const httpLink = createHttpLink({
  // Use the appropriate server URL - update this for your environment
  uri: __DEV__ 
    ? 'http://localhost:3001/api/graphql'  // Development  
    : 'https://your-production-domain.com/api/graphql', // Production
  credentials: 'include',
});

// Auth link to add authentication headers
const authLink = setContext(async (_, { headers }) => {
  try {
    // Get authentication token from AsyncStorage
    const token = await AsyncStorage.getItem('auth_token');
    
    return {
      headers: {
        ...headers,
        // Add authorization header if token exists
        ...(token && { authorization: `Bearer ${token}` }),
        // Add any additional headers for mobile
        'Content-Type': 'application/json',
        'x-client-type': 'mobile',
      },
    };
  } catch (error) {
    console.warn('Failed to get auth token from storage:', error);
    return { headers };
  }
});

// Error link for handling GraphQL errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle specific error types for mobile
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Clear auth token and redirect to login
        AsyncStorage.removeItem('auth_token');
        console.warn('User is not authenticated');
        // You can dispatch a navigation action here
      } else if (extensions?.code === 'FORBIDDEN') {
        console.warn('User is not authorized for this action');
      }
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Handle network errors for mobile
    if (networkError.message.includes('Network request failed')) {
      console.warn('Network connection lost - showing offline mode');
      // You can dispatch an offline mode action here
    }
  }
});

// Configure cache with mobile-optimized settings
const cache = new InMemoryCache({
  typePolicies: {
    User: {
      fields: {
        listings: {
          merge(existing = { edges: [] }, incoming: any) {
            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges],
            };
          },
        },
        bookings: {
          merge(existing = { edges: [] }, incoming: any) {
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
          merge(existing = { edges: [] }, incoming: any) {
            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges],
            };
          },
        },
      },
    },
    Query: {
      fields: {
        listings: {
          keyArgs: ['filter', 'sort'],
          merge(existing = { edges: [] }, incoming: any) {
            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges],
            };
          },
        },
        bookings: {
          keyArgs: ['filter', 'sort'],
          merge(existing = { edges: [] }, incoming: any) {
            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges],
            };
          },
        },
      },
    },
  },
});

// Create Apollo Client instance with mobile-optimized settings
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
      // Cache queries for better offline experience
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Enable development tools in debug mode
  connectToDevTools: __DEV__,
});

// Export shared GraphQL operations for use in components
// export { QUERIES, MUTATIONS }; // Temporarily disabled for deployment

// Helper function to reset Apollo cache (useful for logout)
export const resetApolloCache = async () => {
  await AsyncStorage.removeItem('auth_token');
  return apolloClient.resetStore();
};

// Helper function to refetch all active queries
export const refetchActiveQueries = () => {
  return apolloClient.refetchQueries({
    include: 'active',
  });
};

// Helper function to set auth token
export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem('auth_token', token);
  // Refetch queries after authentication
  return refetchActiveQueries();
};

// Helper function to get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return null;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
}; 