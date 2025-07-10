import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface BottomSheetState {
  isVisible: boolean;
  content: 'filters' | 'sort' | 'actions' | null;
  data?: any;
}

interface UIState {
  // Network state
  isOffline: boolean;
  
  // Loading states
  isGlobalLoading: boolean;
  loadingMessage?: string;
  
  // Notifications
  notifications: Notification[];
  
  // Bottom sheet state
  bottomSheet: BottomSheetState;
  
  // Modal states
  isImageViewerOpen: boolean;
  imageViewerImages: string[];
  imageViewerIndex: number;
  
  // Actions
  setNetworkStatus: (isOffline: boolean) => void;
  setGlobalLoading: (isLoading: boolean, message?: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  showBottomSheet: (content: BottomSheetState['content'], data?: any) => void;
  hideBottomSheet: () => void;
  openImageViewer: (images: string[], index?: number) => void;
  closeImageViewer: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isOffline: false,
  isGlobalLoading: false,
  loadingMessage: undefined,
  notifications: [],
  bottomSheet: {
    isVisible: false,
    content: null,
    data: undefined,
  },
  isImageViewerOpen: false,
  imageViewerImages: [],
  imageViewerIndex: 0,

  // Actions
  setNetworkStatus: (isOffline: boolean) => {
    set({ isOffline });
    
    // Add notification when going offline
    if (isOffline) {
      get().addNotification({
        type: 'warning',
        title: 'No Internet Connection',
        message: 'Some features may be limited while offline.',
        duration: 5000,
      });
    }
  },

  setGlobalLoading: (isLoading: boolean, message?: string) => {
    set({ 
      isGlobalLoading: isLoading, 
      loadingMessage: message 
    });
  },

  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      id,
      duration: 4000, // Default 4 seconds
      ...notification,
    };

    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  showBottomSheet: (content: BottomSheetState['content'], data?: any) => {
    set({
      bottomSheet: {
        isVisible: true,
        content,
        data,
      }
    });
  },

  hideBottomSheet: () => {
    set({
      bottomSheet: {
        isVisible: false,
        content: null,
        data: undefined,
      }
    });
  },

  openImageViewer: (images: string[], index = 0) => {
    set({
      isImageViewerOpen: true,
      imageViewerImages: images,
      imageViewerIndex: index,
    });
  },

  closeImageViewer: () => {
    set({
      isImageViewerOpen: false,
      imageViewerImages: [],
      imageViewerIndex: 0,
    });
  },
})); 