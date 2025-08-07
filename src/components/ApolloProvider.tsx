import React from 'react';
import { ApolloProvider as ApolloProviderBase } from '@apollo/client';
import { apolloClient } from '../lib/apollo-client';

interface ApolloProviderProps {
  children: React.ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <ApolloProviderBase client={apolloClient}>
      {children}
    </ApolloProviderBase>
  );
} 