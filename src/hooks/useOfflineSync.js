import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useOfflineSync = () => {
  const { isOnline, setOnlineStatus, offlineQueue, clearOfflineQueue } = useStore();

  useEffect(() => {
    const handleOnline = async () => {
      setOnlineStatus(true);
      toast.success('Back online! Syncing...', { duration: 3000 });

      // Process offline queue
      if (offlineQueue.length > 0) {
        for (const action of offlineQueue) {
          try {
            await api({
              method: action.method,
              url: action.url,
              data: action.data,
            });
          } catch (err) {
            console.error('Sync failed for:', action);
          }
        }
        clearOfflineQueue();
        toast.success(`✅ Synced ${offlineQueue.length} actions`, { duration: 4000 });
      }
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      toast.error('You are offline. Changes will sync later.', { duration: 5000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);
};
