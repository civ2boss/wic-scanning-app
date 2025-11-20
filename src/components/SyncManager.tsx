import { useQuery } from "convex/react";
import { useLiveQuery } from "dexie-react-hooks";
import { api } from "../../convex/_generated/api";
import { db } from "../lib/db";
import { useState, useEffect } from "react";
import { syncAPLData } from "../lib/sync";

export default function SyncManager() {
  // 1. Subscribe to Server Metadata (Real-time)
  const remoteMetadata = useQuery(api.sync.getSyncMetadata);
  
  // 2. Subscribe to Local Metadata (IndexedDB)
  const localMetadata = useLiveQuery(() => db.syncMetadata.get("current"));

  const [isSyncing, setIsSyncing] = useState(false);
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

  const handleAutoSync = async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      await syncAPLData();
      setUpdateAvailable(false);
    } catch (error) {
      console.error("Auto-sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
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
        disabled={isSyncing}
        className="bg-white text-purple-900 px-4 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-2"
      >
        {isSyncing ? (
            <>
                <span className="animate-spin">↻</span>
                Updating...
            </>
        ) : (
            "Update Now"
        )}
      </button>
    </div>
  );
}

