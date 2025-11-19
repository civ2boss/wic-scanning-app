import { formatRelative } from "date-fns";
import { useEffect, useState } from "react";
import { db } from "../lib/db";
import { useLiveQuery } from "dexie-react-hooks";

function LastSyncStatus() {
  const metadata = useLiveQuery(() => db.syncMetadata.get("current"));
  const loading = metadata === undefined && metadata !== null; // Initial loading state logic if needed, but useLiveQuery handles it well

  if (!metadata) {
    return (
      <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Last updated</span>
        <span className="font-medium text-gray-200 text-right">Never</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Products loaded</span>
        <span className="font-medium text-gray-200">0</span>
      </div>
    </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Last updated</span>
        <span className="font-medium text-gray-200 text-right">
            {metadata.lastSyncDate ? formatRelative(metadata.lastSyncDate, new Date()) : "Never"}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Products loaded</span>
        <span className="font-medium text-gray-200">{metadata.totalProducts?.toLocaleString() ?? "0"}</span>
      </div>
    </div>
  );
}

export default LastSyncStatus;
