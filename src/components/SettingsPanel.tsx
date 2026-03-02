import { useEffect, useState } from "react";

export type ThemePreference = 'light' | 'dark' | 'system';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [theme, setTheme] = useState<ThemePreference>('system');

  useEffect(() => {
    // Load preference from localStorage
    const savedTheme = localStorage.getItem('theme-preference') as ThemePreference;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [isOpen]);

  const handleThemeChange = (newTheme: ThemePreference) => {
    setTheme(newTheme);
    localStorage.setItem('theme-preference', newTheme);
    
    // Apply theme changes to document
    const isDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm h-full bg-wic-bg border-l border-wic-border shadow-2xl animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-wic-border bg-wic-card">
          <h2 className="text-xl font-serif font-bold text-wic-text tracking-tight">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-wic-text/60 hover:text-wic-text hover:bg-wic-sage/10 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-wic-sage uppercase tracking-widest flex items-center gap-2 mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-wic-sage"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
               Appearance
            </h3>
            
            <div className="space-y-3 bg-wic-card p-2 rounded-2xl border border-wic-border">
              {(['system', 'light', 'dark'] as ThemePreference[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium ${theme === t ? 'bg-wic-sage/15 text-wic-sage-dark' : 'text-wic-text/80 hover:bg-wic-sage/5 hover:text-wic-text'}`}
                >
                  <span className="capitalize">{t} Default</span>
                  {theme === t && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-wic-sage-dark">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              ))}
            </div>
            
            <p className="mt-3 text-sm text-wic-text/60 px-2 leading-relaxed">
              If system default is selected, WIC Scanner will automatically switch according to your device's mode.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
