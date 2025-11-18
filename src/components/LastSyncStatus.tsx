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
      <div className="p-2">
        <p className="text-gray-600">Loading sync status...</p>
      </div>
    );
  }

  return (
    <div>
      <p>
        Last sync:{" "}
        {lastSyncDate ? formatRelative(lastSyncDate, new Date()) : "Never"}
      </p>
      <p>Total products: {totalProducts ?? "N/A"}</p>
    </div>
  );
}

export default LastSyncStatus;
