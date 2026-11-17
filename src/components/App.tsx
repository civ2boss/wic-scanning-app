import { ConvexProvider } from "convex/react";
import {
  Book,
  Database,
  RefreshCcw,
  ScanLine,
  Search,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Toaster } from "sonner";
import { convex } from "../lib/convex";
import {
  type Household,
  loadHousehold,
  PARTICIPANT_LABELS,
  saveHousehold,
} from "../lib/db";
import { getHouseholdCvbTotal } from "../lib/eligibility";
import { syncAPLData } from "../lib/sync";
import BarcodeScanner from "./BarcodeScanner";
import LastSyncStatus from "./LastSyncStatus";
import { ProductSearchModal } from "./ProductSearchModal";
import { SettingsPanel } from "./SettingsPanel";
import { SyncButton } from "./SyncButton";
import SyncManager from "./SyncManager";
import { WicFoodsGuide } from "./WicFoodsGuide";

export type SyncStatus = "idle" | "loading" | "success" | "error";

export function App() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState<string>("");
  const [productCount, setProductCount] = useState<number | null>(null);

  // Initialize household participants from local storage (migrates legacy single-participant key automatically)
  const [household, setHousehold] = useState<Household>(() => loadHousehold());

  const handleHouseholdChange = useCallback((next: Household) => {
    setHousehold(next);
    saveHousehold(next);
  }, []);

  const handleSync = useCallback(async () => {
    if (syncStatus === "loading") return;

    setSyncStatus("loading");
    setSyncMessage("Syncing database...");

    try {
      const result = await syncAPLData();
      setSyncStatus("success");
      setSyncMessage(`Successfully synced ${result.productCount} products!`);
      setProductCount(result.productCount);
    } catch (error) {
      setSyncStatus("error");
      setSyncMessage(error instanceof Error ? error.message : "Sync failed");
      console.error("Sync error:", error);
    }
  }, [syncStatus]);

  const totalCvb = getHouseholdCvbTotal(household);

  return (
    <ConvexProvider client={convex}>
      <Toaster position="top-center" richColors theme="system" />
      <SyncManager syncStatus={syncStatus} onSync={handleSync} />
      <div className="min-h-screen bg-wic-bg text-wic-text font-sans selection:bg-wic-sage selection:text-white pb-0">
        <main className="max-w-md mx-auto min-h-[100dvh] flex flex-col relative bg-wic-card shadow-2xl overflow-hidden sm:ring-1 sm:ring-black/5">
          {/* Header */}
          <header className="bg-wic-sage text-white pt-16 pb-14 px-8 rounded-b-[3rem] shadow-sm z-10 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-wic-sage-dark rounded-full opacity-40 mix-blend-multiply blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-wic-yellow rounded-full opacity-30 mix-blend-multiply blur-xl"></div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight">
                  WIC Scanner
                </h1>
                <p className="text-white/90 font-medium text-lg leading-tight">
                  Nourishing families, simplified.
                </p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Open Settings"
                className="p-2 -mr-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
              >
                <Settings size={24} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center px-6 gap-8 pb-10 -mt-6 z-20 overflow-y-auto">
            {/* Action Buttons */}
            <div className="w-full flex flex-col items-center justify-center shrink-0 gap-4">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="group relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] bg-wic-card rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_50px_rgba(224,122,95,0.15)] transition-all duration-300 active:scale-95 border border-wic-border flex flex-col items-center justify-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-wic-terracotta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 w-20 h-20 bg-wic-terracotta text-white rounded-[1.5rem] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 origin-center">
                  <ScanLine size={34} strokeWidth={2.5} aria-hidden="true" />
                </div>
                <span className="relative z-10 font-serif text-xl font-bold text-wic-text group-hover:text-wic-terracotta transition-colors">
                  Tap to Scan
                </span>
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="group relative w-[180px] sm:w-[200px] h-[52px] bg-wic-card rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(224,122,95,0.1)] transition-all duration-300 active:scale-95 border border-wic-border flex flex-row items-center justify-center gap-3 overflow-hidden text-wic-text/80 hover:text-wic-terracotta"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-wic-terracotta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 transition-colors">
                  <Search size={20} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span className="relative z-10 font-medium transition-colors">
                  Search Manually
                </span>
              </button>

              <button
                onClick={() => setIsGuideOpen(true)}
                className="group relative w-[180px] sm:w-[200px] h-[52px] bg-wic-card rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(129,178,154,0.15)] transition-all duration-300 active:scale-95 border border-wic-border flex flex-row items-center justify-center gap-3 overflow-hidden text-wic-text/80 hover:text-wic-sage"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-wic-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 transition-colors">
                  <Book size={20} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span className="relative z-10 font-medium transition-colors">
                  WIC Foods Guide
                </span>
              </button>
            </div>

            {/* Status Cards */}
            <div className="w-full flex flex-col gap-6">
              {/* Active Context Card */}
              {household.length > 0 ? (
                <div className="bg-wic-bg p-5 rounded-[2rem] border border-wic-border shadow-sm flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-wic-sage uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <User
                        size={14}
                        strokeWidth={2.5}
                        aria-hidden="true"
                        className="text-wic-sage"
                      />
                      Household Participants ({household.length})
                    </h3>
                    <p className="font-medium text-wic-text text-sm leading-snug">
                      {household
                        .map((type) => PARTICIPANT_LABELS[type])
                        .join(", ")}
                    </p>
                    {totalCvb > 0 && (
                      <p className="text-xs text-wic-sage font-semibold mt-1">
                        Fruits &amp; Veggies CVB: ${totalCvb}.00/mo
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-wic-text/60 hover:text-wic-text bg-wic-sage/5 hover:bg-wic-sage/15 p-2 rounded-xl transition-colors text-sm font-medium shrink-0"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="bg-wic-tip-soft p-5 rounded-[2rem] border border-wic-tip/30 flex items-center justify-between gap-3">
                  <div className="flex gap-3">
                    <Shield
                      size={20}
                      strokeWidth={2.5}
                      aria-hidden="true"
                      className="text-wic-tip-ink mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm text-wic-text/90 font-medium leading-relaxed">
                        No participants selected
                      </p>
                      <p className="text-xs text-wic-text/60 mt-0.5">
                        Select your household participants in settings to check
                        food eligibility and CVB allowances.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-wic-text/70 hover:text-wic-text bg-wic-yellow/20 hover:bg-wic-yellow/30 px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold shrink-0"
                  >
                    Select
                  </button>
                </div>
              )}

              {/* Database Info & Sync wrapper */}
              <div className="flex flex-col gap-0 overflow-hidden bg-wic-card border border-wic-border rounded-[2rem] shadow-sm">
                <div className="p-5 sm:p-6 border-b border-wic-border flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-wic-sage uppercase tracking-widest flex items-center gap-2 mb-1">
                    <Database
                      size={16}
                      strokeWidth={2.5}
                      aria-hidden="true"
                      className="text-wic-sage"
                    />
                    Database Status
                  </h3>
                  <LastSyncStatus />
                </div>

                <div className="p-5 sm:p-6 bg-wic-panel">
                  <h3 className="text-xs font-bold text-wic-sage uppercase tracking-widest mb-4 flex items-center gap-2">
                    <RefreshCcw
                      size={16}
                      strokeWidth={2.5}
                      aria-hidden="true"
                      className="text-wic-sage"
                    />
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
            household={household}
          />
        )}

        {/* Product Search */}
        {isSearchOpen && (
          <ProductSearchModal
            onClose={() => setIsSearchOpen(false)}
            household={household}
          />
        )}

        {/* WIC Foods Guide */}
        {isGuideOpen && (
          <WicFoodsGuide
            household={household}
            onClose={() => setIsGuideOpen(false)}
          />
        )}

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          household={household}
          onHouseholdChange={handleHouseholdChange}
        />
      </div>
    </ConvexProvider>
  );
}

export default App;
