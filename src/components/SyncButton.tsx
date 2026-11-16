import type { SyncStatus } from "./App";
import { Spinner } from "./Spinner";

interface SyncButtonProps {
  syncStatus: SyncStatus;
  syncMessage: string;
  productCount: number | null;
  onSync: () => Promise<void>;
}

export function SyncButton({
  syncStatus,
  syncMessage,
  productCount,
  onSync,
}: SyncButtonProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onSync}
        disabled={syncStatus === "loading"}
        className="w-full px-5 py-3.5 bg-wic-sage text-white rounded-[1rem] font-medium hover:bg-wic-sage-dark disabled:bg-wic-border disabled:text-wic-text/40 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {syncStatus === "loading" ? (
          <>
            <Spinner className="h-5 w-5 text-white" />
            <span>Syncing Database...</span>
          </>
        ) : (
          "Sync Database"
        )}
      </button>

      {syncStatus !== "idle" && (
        <div
          className={`mt-4 p-4 rounded-xl text-sm border font-medium ${
            syncStatus === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : syncStatus === "error"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
          }`}
        >
          {syncMessage}
        </div>
      )}

      {productCount !== null && (
        <div className="mt-3 text-xs text-center text-wic-text/60 font-medium">
          New count: {productCount.toLocaleString()} products
        </div>
      )}
    </div>
  );
}
