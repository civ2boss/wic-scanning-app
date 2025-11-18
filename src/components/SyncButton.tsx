import { useState } from 'react';
import { syncAPLData } from '../lib/sync';

export function SyncButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [productCount, setProductCount] = useState<number | null>(null);

  const handleSync = async () => {
    setStatus('loading');
    setMessage('Finding APL link...');
    
    try {
      const result = await syncAPLData();
      setStatus('success');
      setMessage(`Successfully synced ${result.productCount} products!`);
      setProductCount(result.productCount);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Sync failed');
      console.error('Sync error:', error);
    }
  };

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={handleSync}
        disabled={status === 'loading'}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Syncing...' : 'Sync APL Data'}
      </button>
      
      {status !== 'idle' && (
        <div className={`mt-2 p-2 rounded ${
          status === 'success' ? 'bg-green-100 text-green-800' :
          status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}
      
      {productCount !== null && (
        <div className="mt-2 text-sm text-gray-600">
          Products in database: {productCount}
        </div>
      )}
    </div>
  );
}