import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Household } from "../lib/db";
import {
  getHouseholdCvbTotal,
  PARTICIPANT_CVB_DOLLARS,
  PARTICIPANT_LABELS,
} from "../lib/eligibility";
import { ParticipantSelector } from "./ParticipantSelector";
import { Sheet } from "./Sheet";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  onHouseholdChange: (household: Household) => void;
}

type Theme = "light" | "dark" | "system";

export function SettingsPanel({
  isOpen,
  onClose,
  household,
  onHouseholdChange,
}: SettingsPanelProps) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme-preference") as Theme | null;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme-preference", newTheme);
    toast.success(`Appearance updated to ${newTheme}`);

    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (systemDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const handleHouseholdChange = (next: Household) => {
    onHouseholdChange(next);
    toast.success("Participant preferences saved");
  };

  if (!isOpen) return null;

  const totalCvb = getHouseholdCvbTotal(household);

  return (
    <Sheet
      title="Settings"
      closeLabel="Close settings"
      variant="drawer"
      onClose={onClose}
      footer={
        <div className="pt-6 border-t border-wic-border text-center">
          <p className="text-xs text-wic-text/40 font-medium">
            NYS WIC Food Scanner App
          </p>
        </div>
      }
    >
      {/* Theme Setting */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold uppercase tracking-wider text-wic-text/70">
          Appearance
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["light", "dark", "system"] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`py-3 px-4 rounded-xl border font-medium capitalize flex flex-col items-center gap-2 transition-all ${
                theme === t
                  ? "bg-wic-sage/10 border-wic-sage text-wic-sage shadow-sm"
                  : "bg-wic-card border-wic-border text-wic-text/70 hover:border-wic-text/30"
              }`}
            >
              {t === "light" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
              {t === "dark" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              {t === "system" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              )}
              <span className="text-xs">{t} Default</span>
            </button>
          ))}
        </div>
      </div>

      {/* Household Participant Setting */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold uppercase tracking-wider text-wic-text/70">
            WIC Household
          </label>
          {household.length > 0 && (
            <button
              onClick={() => {
                onHouseholdChange([]);
                toast.success("Household preferences cleared");
              }}
              className="text-xs text-wic-terracotta hover:underline font-medium"
            >
              Clear Selection
            </button>
          )}
        </div>
        <p className="text-xs text-wic-text/60 mb-2 leading-relaxed">
          Select all WIC participants in your household to check product
          eligibility across your entire eWIC card when scanning.
        </p>
        <ParticipantSelector
          value={household}
          onChange={handleHouseholdChange}
        />

        {/* Household CVB Summary */}
        {household.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-wic-sage/10 border border-wic-sage/20 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-wic-sage">
                Monthly Fruit & Veggie CVB
              </span>
              <span className="text-base font-bold text-wic-sage">
                ${totalCvb}.00/mo
              </span>
            </div>
            <div className="space-y-1 pt-1 border-t border-wic-sage/15">
              {household.map((type) => (
                <div
                  key={type}
                  className="flex justify-between items-center text-xs text-wic-text/80"
                >
                  <span>{PARTICIPANT_LABELS[type]}</span>
                  <span className="font-semibold">
                    ${PARTICIPANT_CVB_DOLLARS[type] || 0}.00
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
