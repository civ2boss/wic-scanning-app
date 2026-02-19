import { useQuery } from "convex/react";
import { useLiveQuery } from "dexie-react-hooks";
import { api } from "../../convex/_generated/api";
import { db } from "../lib/db";
import { useState, useEffect } from "react";
import type { SyncStatus } from "./App";

interface SyncManagerProps {
  syncStatus: SyncStatus;
  onSync: () => Promise<void>;
}

export default function SyncManager({ syncStatus, onSync }: SyncManagerProps) {
  // 1. Subscribe to Server Metadata (Real-time)
  const remoteMetadata = useQuery(api.sync.getSyncMetadata);
  
  // 2. Subscribe to Local Metadata (IndexedDB)
  const localMetadata = useLiveQuery(() => db.syncMetadata.get("current"));

  const [updateAvailable, setUpdateAvailable] = useState(false);

  // 3. Compare and Check for Updates
  useEffect(() => {
    if (remoteMetadata && localMetadata) {
      const remoteTime = new Date(remoteMetadata.lastSyncDate).getTime();
      const localTime = new Date(localMetadata.lastSyncDate).getTime();

      // If server is newer by more than 1 minute (avoid clock drift issues)
      if (remoteTime > localTime + 60000) {
        setUpdateAvailable(true);
      } else {
        setUpdateAvailable(false);
      }
    } else if (remoteMetadata && !localMetadata) {
        // If we have remote data but no local data, we definitely need an update
        setUpdateAvailable(true);
    }
  }, [remoteMetadata, localMetadata]);

  // Hide update banner after successful sync
  useEffect(() => {
    if (syncStatus === 'success') {
      setUpdateAvailable(false);
    }
  }, [syncStatus]);

  const handleAutoSync = async () => {
    if (syncStatus === 'loading') return;
    await onSync();
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-purple-900 text-white p-4 rounded-xl shadow-2xl border border-purple-700 z-50 flex items-center justify-between animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex flex-col">
        <span className="font-bold text-sm">Update Available</span>
        <span className="text-xs text-purple-200">New WIC products detected.</span>
      </div>
      <button 
        onClick={handleAutoSync}
        disabled={syncStatus === 'loading'}
        className="bg-white text-purple-900 px-4 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-2"
      >
        {syncStatus === 'loading' ? (
            <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
            </>
        ) : (
            "Update Now"
        )}
      </button>
    </div>
  );
}
