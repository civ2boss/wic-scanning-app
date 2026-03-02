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
        className="w-full px-5 py-3.5 bg-wic-sage text-white rounded-[1rem] font-medium hover:bg-wic-sage-dark disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
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
          syncStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          syncStatus === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
          'bg-sky-50 text-sky-800 border-sky-200'
        }`}>
          {syncMessage}
        </div>
      )}
      
      {productCount !== null && (
        <div className="mt-3 text-xs text-center text-stone-500 font-medium">
          New count: {productCount.toLocaleString()} products
        </div>
      )}
    </div>
  );
}
