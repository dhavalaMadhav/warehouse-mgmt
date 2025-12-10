import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // User & Auth
      user: null,
      role: null, // 'picker', 'checker', 'packer', 'admin'
      setUser: (user, role) => set({ user, role }),
      logout: () => set({ user: null, role: null }),

      // Cache
      itemsCache: [],
      locationsCache: [],
      setItemsCache: (items) => set({ itemsCache: items }),
      setLocationsCache: (locations) => set({ locationsCache: locations }),

      // Pick Cart (multi-pick)
      pickCart: [],
      addToPickCart: (item) => set((state) => ({ 
        pickCart: [...state.pickCart, item] 
      })),
      removeFromPickCart: (id) => set((state) => ({
        pickCart: state.pickCart.filter(i => i.id !== id)
      })),
      clearPickCart: () => set({ pickCart: [] }),

      // Offline Queue
      offlineQueue: [],
      addToOfflineQueue: (action) => set((state) => ({
        offlineQueue: [...state.offlineQueue, { ...action, timestamp: Date.now() }]
      })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),

      // UI State
      isOnline: navigator.onLine,
      setOnlineStatus: (status) => set({ isOnline: status }),
    }),
    {
      name: 'wms-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        itemsCache: state.itemsCache,
        locationsCache: state.locationsCache,
      }),
    }
  )
);
