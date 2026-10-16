import { useState } from "react";
import type { ParticipantType } from "../lib/db";
import {
  PARTICIPANT_CVB_DOLLARS,
  PARTICIPANT_LABELS,
} from "../lib/eligibility";

interface ParticipantSelectorProps {
  selectedType?: ParticipantType | null;
  onSelect?: (type: ParticipantType) => void;
  selectedTypes?: ParticipantType[];
  onChange?: (types: ParticipantType[]) => void;
}

const PARTICIPANT_TYPES: ParticipantType[] = [
  "INFANT_0_6",
  "INFANT_6_12",
  "CHILD_1_2",
  "CHILD_2_5",
  "PREGNANT",
  "PARTIALLY_BREASTFEEDING",
  "BREASTFEEDING",
  "POSTPARTUM",
];

export function ParticipantSelector({
  selectedType = null,
  onSelect,
  selectedTypes,
  onChange,
}: ParticipantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isMultiSelect = typeof onChange === "function";
  const activeTypes: ParticipantType[] =
    selectedTypes !== undefined
      ? selectedTypes
      : selectedType
        ? [selectedType]
        : [];

  const handleOptionClick = (type: ParticipantType) => {
    onSelect?.(type);

    if (isMultiSelect && onChange) {
      const exists = activeTypes.includes(type);
      const next = exists
        ? activeTypes.filter((t) => t !== type)
        : [...activeTypes, type];
      onChange(next);
    } else {
      setIsOpen(false);
    }
  };

  const summaryLabel =
    activeTypes.length === 0
      ? "Select Your WIC Participant"
      : activeTypes.length === 1
        ? PARTICIPANT_LABELS[activeTypes[0]]
        : `${activeTypes.length} Household Members`;

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 bg-wic-card border border-wic-border rounded-2xl shadow-sm text-left flex justify-between items-center hover:border-wic-sage/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-wic-sage/20"
      >
        <div className="min-w-0 pr-3">
          <span className="font-medium text-wic-text block truncate">
            {summaryLabel}
          </span>
          {activeTypes.length > 1 && (
            <span className="text-xs text-wic-text/60 block truncate mt-0.5">
              {activeTypes.map((t) => PARTICIPANT_LABELS[t]).join(" • ")}
            </span>
          )}
        </div>
        <span className="text-wic-text/40 text-xs transition-transform duration-200 shrink-0">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 bg-wic-card border border-wic-border rounded-2xl shadow-xl overflow-hidden z-20 relative">
          {isMultiSelect && (
            <div className="px-5 py-2.5 bg-wic-bg/60 border-b border-wic-border flex justify-between items-center">
              <span className="text-xs font-medium text-wic-text/70">
                Select all WIC participants in your household
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-wic-sage hover:underline"
              >
                Done
              </button>
            </div>
          )}
          {PARTICIPANT_TYPES.map((type) => {
            const isSelected = activeTypes.includes(type);
            const cvb = PARTICIPANT_CVB_DOLLARS?.[type] ?? 0;

            return (
              <button
                type="button"
                key={type}
                onClick={() => handleOptionClick(type)}
                className={`w-full px-5 py-3.5 text-left hover:bg-wic-bg transition-colors border-b border-wic-border last:border-b-0 flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-wic-sage/10 text-wic-sage font-semibold"
                    : "text-wic-text/80"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isMultiSelect && (
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ${
                        isSelected
                          ? "bg-wic-sage border-wic-sage text-white"
                          : "border-wic-border bg-wic-bg"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                  )}
                  <span className="truncate">{PARTICIPANT_LABELS[type]}</span>
                </div>
                {cvb > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-wic-sage/10 text-wic-sage shrink-0">
                    ${cvb}/mo CVB
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
