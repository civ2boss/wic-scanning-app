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
import { SettingsPanel } from './SettingsPanel';
import { Toaster } from 'sonner';
import { PARTICIPANT_LABELS } from '../lib/eligibility';

export type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

export default function App() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [productCount, setProductCount] = useState<number | null>(null);
  
  // Initialize participant from local storage if existing
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantType | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wic-participant') as ParticipantType;
      return saved || null;
    }
    return null;
  });

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
      <Toaster position="top-center" richColors theme="system" />
      <SyncManager 
        syncStatus={syncStatus} 
        onSync={handleSync} 
      />
      <div className="min-h-screen bg-wic-bg text-wic-text font-sans selection:bg-wic-sage selection:text-white pb-0">
        <main className="max-w-md mx-auto min-h-[100dvh] flex flex-col relative bg-wic-card shadow-2xl overflow-hidden sm:ring-1 sm:ring-black/5">
          
          {/* Header */}
          <header className="bg-wic-sage text-white pt-16 pb-14 px-8 rounded-b-[3rem] shadow-sm z-10 relative overflow-hidden shrink-0">
              {/* Subtle organic pattern or shape */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-wic-sage-dark rounded-full opacity-40 mix-blend-multiply blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-wic-yellow rounded-full opacity-30 mix-blend-multiply blur-xl"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight">WIC Scanner</h1>
                  <p className="text-white/90 font-medium text-lg leading-tight">Nourishing families, simplified.</p>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 -mr-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
              </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center px-6 gap-8 pb-10 -mt-6 z-20 overflow-y-auto">
              
              {/* Scan Button */}
              <div className="w-full flex items-center justify-center shrink-0">
                  <button
                      onClick={() => setIsScannerOpen(true)}
                      className="group relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] bg-wic-card rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_50px_rgba(224,122,95,0.15)] transition-all duration-300 active:scale-95 border border-wic-border flex flex-col items-center justify-center gap-4 overflow-hidden"
                  >
                      {/* Interactive glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-wic-terracotta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative z-10 w-20 h-20 bg-wic-terracotta text-white rounded-[1.5rem] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 origin-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                              <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                              <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                              <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                              <line x1="7" y1="12" x2="17" y2="12"></line>
                          </svg>
                      </div>
                      <span className="relative z-10 font-serif text-xl font-bold text-wic-text group-hover:text-wic-terracotta transition-colors">Tap to Scan</span>
                  </button>
              </div>

              {/* Status Cards */}
              <div className="w-full flex flex-col gap-6 w-full">
                  
                  {/* Active Context Card (If participant is set) */}
                  {selectedParticipant ? (
                    <div className="bg-wic-bg p-5 rounded-[2rem] border border-wic-border shadow-sm flex items-center justify-between">
                         <div>
                            <h3 className="text-xs font-bold text-wic-sage uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-wic-sage"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                Selected Participant
                            </h3>
                            <p className="font-medium text-wic-text">
                              {PARTICIPANT_LABELS[selectedParticipant]}
                            </p>
                         </div>
                         <button 
                             onClick={() => setIsSettingsOpen(true)}
                             className="text-wic-text/60 hover:text-wic-text bg-wic-sage/5 hover:bg-wic-sage/15 p-2 rounded-xl transition-colors text-sm font-medium"
                         >
                            Change
                         </button>
                    </div>
                  ) : (
                    <div className="bg-wic-yellow/15 p-5 rounded-[2rem] border border-wic-yellow/30 flex items-center justify-between">
                         <div className="flex gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-wic-yellow mt-0.5" style={{ filter: "brightness(0.8)" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
                            <div>
                              <p className="text-sm text-wic-text/90 font-medium leading-relaxed">
                                No participant selected
                              </p>
                              <p className="text-xs text-wic-text/60 mt-0.5">Please select one in settings to correctly calculate produce eligibility.</p>
                            </div>
                         </div>
                    </div>
                  )}
                  
                  {/* Database Info & Sync wrapper */}
                  <div className="flex flex-col gap-0 overflow-hidden bg-wic-card border border-wic-border rounded-[2rem] shadow-sm">
                    <div className="p-5 sm:p-6 border-b border-wic-border flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-wic-sage uppercase tracking-widest flex items-center gap-2 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-wic-sage"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                            Database Status
                        </h3>
                        <LastSyncStatus />
                    </div>
                    
                    <div className="p-5 sm:p-6 bg-wic-panel">
                        <h3 className="text-xs font-bold text-wic-sage uppercase tracking-widest mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-wic-sage"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
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
          </div>

        </main>

        {/* Full Screen Scanner */}
        {isScannerOpen && (
          <BarcodeScanner 
            onClose={() => setIsScannerOpen(false)} 
            selectedParticipant={selectedParticipant}
          />
        )}
        
        {/* Settings Panel */}
        <SettingsPanel 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          selectedParticipant={selectedParticipant}
          setSelectedParticipant={setSelectedParticipant}
        />
      </div>
    </ConvexProvider>
  );
}
