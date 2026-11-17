import { useQuery } from "convex/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { db } from "../lib/db";
import type { SyncStatus } from "./App";
import { Spinner } from "./Spinner";

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
    if (syncStatus === "success") {
      setUpdateAvailable(false);
    }
  }, [syncStatus]);

  const handleAutoSync = async () => {
    if (syncStatus === "loading") return;
    await onSync();
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-[calc(28rem-2rem)] mx-auto bg-wic-sage text-white p-4 sm:p-5 rounded-[1.5rem] shadow-2xl border border-wic-sage-dark/50 z-50 flex items-center justify-between animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex flex-col">
        <span className="font-bold text-sm">Update Available</span>
        <span className="text-xs text-white/90 font-medium">
          New WIC products detected.
        </span>
      </div>
      <button
        onClick={handleAutoSync}
        disabled={syncStatus === "loading"}
        className="bg-white text-wic-sage px-5 py-2.5 rounded-[1rem] text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-2 hover:bg-stone-50"
      >
        {syncStatus === "loading" ? (
          <>
            <Spinner className="h-4 w-4" />
            Updating...
          </>
        ) : (
          "Update Now"
        )}
      </button>
    </div>
  );
}
