import { useEffect, useState } from "react";
import { db } from "../lib/db";

function LastSyncStatus() {
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);

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
      }
    }

    loadSyncStatus();
  }, []);

  return (
    <div>
      <p>Last sync: {lastSyncDate ? lastSyncDate.toLocaleString() : "Never"}</p>
      <p>Total products: {totalProducts ?? "N/A"}</p>
    </div>
  );
}

export default LastSyncStatus;
