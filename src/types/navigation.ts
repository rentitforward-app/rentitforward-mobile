import { NavigatorScreenParams } from '@react-navigation/native';

// Tab Navigator Routes
export type TabNavigatorParamList = {
  index: undefined;
  browse: undefined;
  create: undefined;
  bookings: undefined;
  profile: undefined;
};

// Root Stack Navigator Routes  
export type RootStackParamList = {
  '(tabs)': NavigatorScreenParams<TabNavigatorParamList>;
  '(auth)': undefined;
  'listing/[id]': { id: string };
  // Additional screens that can be navigated to from Header/Footer
  Home: undefined;
  Login: undefined;
  Register: undefined;
  About: undefined;
  Guarantee: undefined;
  FAQ: undefined;
  Contact: undefined;
  Terms: undefined;
  Privacy: undefined;
  Categories: undefined;
  CreateListing: undefined;
  Browse: undefined;
  HowItWorks: undefined;
  LearnMore: undefined;
}; 