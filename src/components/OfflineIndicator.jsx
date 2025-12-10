import { useStore } from '../store/useStore';
import { WifiOff, CloudOff } from 'lucide-react';

export default function OfflineIndicator() {
  const { isOnline, offlineQueue } = useStore();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-amber-500 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-pulse">
      <WifiOff className="w-5 h-5" />
      <div>
        <p className="font-semibold text-sm">Offline Mode</p>
        <p className="text-xs opacity-90">
          {offlineQueue.length} actions queued
        </p>
      </div>
    </div>
  );
}
