import type { SyncStatus } from './App';

interface SyncButtonProps {
  syncStatus: SyncStatus;
  syncMessage: string;
  productCount: number | null;
  onSync: () => Promise<void>;
}

export function SyncButton({ syncStatus, syncMessage, productCount, onSync }: SyncButtonProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onSync}
        disabled={syncStatus === 'loading'}
        className="w-full px-5 py-3.5 bg-wic-sage text-white rounded-[1rem] font-medium hover:bg-wic-sage-dark disabled:bg-wic-border disabled:text-wic-text/40 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {syncStatus === 'loading' ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Syncing Database...</span>
          </>
        ) : (
          'Sync Database'
        )}
      </button>
      
      {syncStatus !== 'idle' && (
        <div className={`mt-4 p-4 rounded-xl text-sm border font-medium ${
          syncStatus === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
          syncStatus === 'error' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
          'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
        }`}>
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
