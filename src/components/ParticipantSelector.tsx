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
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors shadow-sm flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          {selectedType
            ? PARTICIPANT_LABELS[selectedType]
            : "Select Your WIC Participant"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${
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
        <div className="mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
          {PARTICIPANT_OPTIONS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onSelect(type);
                setIsExpanded(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                selectedType === type
                  ? "bg-purple-900/30 text-purple-300"
                  : "text-gray-200"
              } ${type === PARTICIPANT_OPTIONS[0] ? "" : "border-t border-gray-700"}`}
            >
              <span className="flex-1">{PARTICIPANT_LABELS[type]}</span>
              {selectedType === type && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-400"
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
      )}

      {selectedType && (
        <div className="mt-3 p-3 bg-purple-900/20 border border-purple-800/50 rounded-lg">
          <p className="text-sm text-purple-300">
            Scanning for: <strong>{PARTICIPANT_LABELS[selectedType]}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
