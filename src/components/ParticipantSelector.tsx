import { useState, useEffect } from "react";
import type { ParticipantType } from "../lib/db";
import { PARTICIPANT_LABELS } from "../lib/eligibility";

interface ParticipantSelectorProps {
  selectedType: ParticipantType | null;
  onSelect: (type: ParticipantType) => void;
}

const PARTICIPANT_OPTIONS: ParticipantType[] = [
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
  selectedType,
  onSelect,
}: ParticipantSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full relative">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 bg-wic-card border-2 border-wic-border text-wic-text rounded-2xl font-medium hover:border-wic-sage hover:bg-wic-panel transition-all shadow-sm flex items-center justify-between active:scale-[0.98]"
      >
        <span className="flex items-center gap-3">
          <div className="bg-wic-sage/10 p-2 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-wic-sage"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className={selectedType ? "text-wic-text" : "text-wic-text/50"}>
            {selectedType
              ? PARTICIPANT_LABELS[selectedType]
              : "Select Your WIC Participant"}
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-wic-text/40 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-wic-card border-2 border-wic-border rounded-2xl overflow-hidden shadow-2xl z-50">
          <div className="max-h-64 overflow-y-auto overscroll-contain">
            {PARTICIPANT_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onSelect(type);
                  setIsExpanded(false);
                }}
                className={`w-full px-5 py-4 text-left hover:bg-wic-panel transition-colors flex items-center gap-3 ${
                  selectedType === type
                    ? "bg-wic-sage/15 text-wic-sage font-semibold"
                    : "text-wic-text/80"
                } ${type === PARTICIPANT_OPTIONS[0] ? "" : "border-t border-wic-border/50"}`}
              >
                <div className="flex-1">
                    {selectedType === type ? (
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-wic-sage"></span>
                           {PARTICIPANT_LABELS[type]}
                        </div>
                    ) : (
                        <div className="pl-3.5">{PARTICIPANT_LABELS[type]}</div>
                    )}
                </div>
                {selectedType === type && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-wic-sage"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
