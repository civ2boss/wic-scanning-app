import { formatRelative } from "date-fns";
import { useEffect, useState } from "react";
import { db } from "../lib/db";

function LastSyncStatus() {
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSyncStatus() {
      try {
        const metadata = await db.syncMetadata.get("current");
        if (metadata) {
          setLastSyncDate(metadata.lastSyncDate);
          setTotalProducts(metadata.totalProducts);
        }
      } catch (error) {
        console.error("Error loading sync status:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSyncStatus();
  }, []);

  if (loading) {
    return (
      <div className="py-2 text-sm text-gray-600 animate-pulse">
        Loading status...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Last updated</span>
        <span className="font-medium text-gray-200 text-right">
            {lastSyncDate ? formatRelative(lastSyncDate, new Date()) : "Never"}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Products loaded</span>
        <span className="font-medium text-gray-200">{totalProducts?.toLocaleString() ?? "0"}</span>
      </div>
    </div>
  );
}

export default LastSyncStatus;
