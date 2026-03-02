import { useState, useCallback } from 'react';
import BarcodeScanner from './BarcodeScanner';
import { SyncButton } from './SyncButton';
import LastSyncStatus from './LastSyncStatus';
import { ConvexProvider } from "convex/react";
import { convex } from "../lib/convex";
import SyncManager from './SyncManager';
import { syncAPLData } from '../lib/sync';
import { ParticipantSelector } from './ParticipantSelector';
import type { ParticipantType } from '../lib/db';

export type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

export default function App() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [productCount, setProductCount] = useState<number | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantType | null>(null);

  const handleSync = useCallback(async () => {
    if (syncStatus === 'loading') return;
    
    setSyncStatus('loading');
    setSyncMessage('Syncing database...');
    
    try {
      const result = await syncAPLData();
      setSyncStatus('success');
      setSyncMessage(`Successfully synced ${result.productCount} products!`);
      setProductCount(result.productCount);
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(error instanceof Error ? error.message : 'Sync failed');
      console.error('Sync error:', error);
    }
  }, [syncStatus]);

  return (
    <ConvexProvider client={convex}>
      <SyncManager 
        syncStatus={syncStatus} 
        onSync={handleSync} 
      />
      <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
        {/* Main Home Screen */}
        <main className="max-w-md mx-auto min-h-screen flex flex-col relative bg-gray-900 shadow-2xl overflow-hidden ring-1 ring-white/5">
          
          {/* Header */}
          <header className="bg-purple-900 text-white pt-12 pb-8 px-6 rounded-b-[2.5rem] shadow-lg z-10 border-b border-purple-800/50">
              <h1 className="text-3xl font-bold mb-2 tracking-tight">WIC Scanner</h1>
              <p className="text-purple-200 opacity-90 font-medium">Scan products to check eligibility</p>
          </header>

          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 py-8">
              
              {/* Scan Button */}
              <div className="w-full max-w-[280px] aspect-square flex items-center justify-center">
                  <button
                      onClick={() => setIsScannerOpen(true)}
                      className="group relative w-full h-full bg-gray-800 rounded-4xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(147,51,234,0.3)] transition-all duration-300 active:scale-95 border border-gray-700 flex flex-col items-center justify-center gap-5 overflow-hidden"
                  >
                      <div className="absolute inset-0 bg-linear-to-tr from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative z-10 w-20 h-20 bg-purple-600 rounded-2xl text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-1 ring-white/10">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                              <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                              <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                              <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                              <line x1="7" y1="12" x2="17" y2="12"></line>
                          </svg>
                      </div>
                      <span className="relative z-10 text-xl font-bold text-gray-200 group-hover:text-purple-400 transition-colors">Tap to Scan</span>
                  </button>
              </div>

              {/* Status Cards */}
              <div className="w-full space-y-4">
                  {/* Participant Selector */}
                  <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          Your WIC Participant
                      </h3>
                      <ParticipantSelector 
                        selectedType={selectedParticipant}
                        onSelect={setSelectedParticipant}
                      />
                  </div>
                  
                  <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                          Database Status
                      </h3>
                      <LastSyncStatus />
                  </div>
                  
                  <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
                          Data Sync
                      </h3>
                      <SyncButton 
                        syncStatus={syncStatus}
                        syncMessage={syncMessage}
                        productCount={productCount}
                        onSync={handleSync}
                      />
                  </div>
              </div>
          </div>

        </main>

        {/* Full Screen Scanner */}
        {isScannerOpen && (
          <BarcodeScanner 
            onClose={() => setIsScannerOpen(false)} 
            selectedParticipant={selectedParticipant}
          />
        )}
      </div>
    </ConvexProvider>
  );
}
