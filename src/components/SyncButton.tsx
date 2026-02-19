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
        className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-500 disabled:bg-purple-800/50 disabled:text-white/50 disabled:cursor-not-allowed transition-colors shadow-sm active:scale-[0.98] ring-1 ring-white/10 flex items-center justify-center gap-2"
      >
        {syncStatus === 'loading' ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Syncing...</span>
          </>
        ) : (
          'Sync Database'
        )}
      </button>
      
      {syncStatus !== 'idle' && (
        <div className={`mt-3 p-3 rounded-lg text-sm border ${
          syncStatus === 'success' ? 'bg-green-900/20 text-green-300 border-green-800/50' :
          syncStatus === 'error' ? 'bg-red-900/20 text-red-300 border-red-800/50' :
          'bg-blue-900/20 text-blue-300 border-blue-800/50'
        }`}>
          {syncMessage}
        </div>
      )}
      
      {productCount !== null && (
        <div className="mt-2 text-xs text-center text-gray-500">
          New count: {productCount} products
        </div>
      )}
    </div>
  );
}
