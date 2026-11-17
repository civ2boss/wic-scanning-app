import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  Info,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import type {
  ProductVerdict as Verdict,
  VerdictStatus,
} from "../lib/productVerdict";
import type { WicFoodSubCategory } from "../lib/wicFoodsGuide";

type Variant = "overlay" | "card";
type Tone = "positive" | "warning" | "negative";

const LABELS: Record<VerdictStatus, string> = {
  eligible: "WIC APPROVED",
  approved: "WIC APPROVED",
  ineligible: "NOT ELIGIBLE",
  "not-found": "NOT WIC APPROVED",
};

const TONES: Record<VerdictStatus, Tone> = {
  eligible: "positive",
  approved: "positive",
  ineligible: "warning",
  "not-found": "negative",
};

const NO_HOUSEHOLD_NOTE =
  "Select your household participants to check eligibility";

const STYLES = {
  overlay: {
    panel: {
      positive:
        "bg-wic-approved-soft/90 border-wic-approved/50 shadow-[0_0_30px_color-mix(in_srgb,var(--color-wic-approved)_30%,transparent)]",
      warning:
        "bg-wic-ineligible-soft/90 border-wic-ineligible/50 shadow-[0_0_30px_color-mix(in_srgb,var(--color-wic-ineligible)_30%,transparent)]",
      negative:
        "bg-wic-error-soft/90 border-wic-error/50 shadow-[0_0_30px_color-mix(in_srgb,var(--color-wic-error)_30%,transparent)]",
    },
    heading: {
      positive: "text-wic-approved-ink",
      warning: "text-wic-ineligible-ink",
      negative: "text-wic-error-ink",
    },
    iconBubble: {
      positive: "bg-wic-approved/20",
      warning: "bg-wic-ineligible/20",
      negative: "bg-wic-error/20",
    },
    icon: {
      positive: "text-wic-approved",
      warning: "text-wic-ineligible",
      negative: "text-wic-error",
    },
  },
  card: {
    panel: {
      positive: "border-wic-approved/30",
      warning: "border-wic-ineligible/30",
      negative: "border-wic-error/30",
    },
    band: {
      positive: "bg-wic-approved-soft",
      warning: "bg-wic-ineligible-soft",
      negative: "bg-wic-error-soft",
    },
    heading: {
      positive: "text-wic-approved-ink",
      warning: "text-wic-ineligible-ink",
      negative: "text-wic-error-ink",
    },
    iconBubble: {
      positive: "bg-wic-approved/15",
      warning: "bg-wic-ineligible/15",
      negative: "bg-wic-error/15",
    },
    icon: {
      positive: "text-wic-approved",
      warning: "text-wic-ineligible",
      negative: "text-wic-error",
    },
  },
} as const;

function StatusIcon({ tone, className }: { tone: Tone; className: string }) {
  const Icon =
    tone === "positive" ? Check : tone === "warning" ? AlertTriangle : X;
  return <Icon className={className} strokeWidth={3} aria-hidden="true" />;
}

/**
 * The verdict for a scanned or searched Product: status header, the screen's
 * own Product details (`children`), per-member badges, reason, WIC Foods Guide
 * info, then `footer`.
 */
export function ProductVerdict({
  verdict,
  variant,
  children,
  footer,
}: {
  verdict: Verdict;
  variant: Variant;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const tone = TONES[verdict.status];
  const label = LABELS[verdict.status];

  if (variant === "overlay") {
    const s = STYLES.overlay;
    // Sits over camera video in either theme, so it always takes the dark tokens.
    return (
      <div
        className={`dark p-5 rounded-2xl shadow-2xl backdrop-blur-md border transform transition-all duration-300 ${s.panel[tone]}`}
      >
        <div className="text-white animate-in zoom-in-95 duration-300">
          <div
            className={`flex items-center gap-2 mb-2 font-bold text-lg ${s.heading[tone]}`}
          >
            <div className={`p-1 rounded-full ${s.iconBubble[tone]}`}>
              <StatusIcon tone={tone} className={`w-6 h-6 ${s.icon[tone]}`} />
            </div>
            {label}
          </div>
          {children}
          <MemberBadges verdict={verdict} variant="overlay" />
          {verdict.reason && (
            <div className="mt-3 p-3 bg-black/30 rounded-lg text-sm text-stone-200 border border-white/10">
              {verdict.reason}
            </div>
          )}
          {verdict.guide && <CompactGuide guide={verdict.guide} />}
          {verdict.status === "approved" && (
            <div className="mt-3 p-3 bg-black/40 rounded-lg text-xs text-stone-300 border border-white/10 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {NO_HOUSEHOLD_NOTE}
            </div>
          )}
          {footer}
        </div>
      </div>
    );
  }

  const s = STYLES.card;
  return (
    <div
      className={`rounded-[2rem] border overflow-hidden bg-wic-card shadow-lg ${s.panel[tone]}`}
    >
      <div className={`p-6 pb-5 ${s.band[tone]}`}>
        <div
          className={`flex items-center gap-3 font-bold text-lg ${s.heading[tone]}`}
        >
          <div className={`p-2 rounded-full ${s.iconBubble[tone]}`}>
            <StatusIcon tone={tone} className={`w-6 h-6 ${s.icon[tone]}`} />
          </div>
          {label}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {children}
        <MemberBadges verdict={verdict} variant="card" />
        <CardNote verdict={verdict} />
        {verdict.guide && <FullGuide guide={verdict.guide} />}
        {footer}
      </div>
    </div>
  );
}

/** Small result-card badge; nothing when Eligibility is unknown. */
export function VerdictBadge({ status }: { status: VerdictStatus }) {
  if (status === "eligible") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-wic-approved-soft text-wic-approved-ink text-[10px] font-bold border border-wic-approved/20">
        <Check className="w-2.5 h-2.5" strokeWidth={3} aria-hidden="true" />
        APPROVED
      </span>
    );
  }
  if (status === "ineligible") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-wic-ineligible-soft text-wic-ineligible-ink text-[10px] font-bold border border-wic-ineligible/20">
        <X className="w-2.5 h-2.5" strokeWidth={3} aria-hidden="true" />
        NOT ELIGIBLE
      </span>
    );
  }
  return null;
}

function MemberBadges({
  verdict,
  variant,
}: {
  verdict: Verdict;
  variant: Variant;
}) {
  if (verdict.members.length < 2) return null;

  const styles =
    variant === "overlay"
      ? {
          eligible:
            "bg-wic-approved/20 text-wic-approved-ink border-wic-approved/40",
          ineligible: "bg-black/30 text-white/60 border-white/15",
        }
      : {
          eligible:
            "bg-wic-approved-soft text-wic-approved-ink border-wic-approved/30",
          ineligible: "bg-wic-bg text-wic-text/60 border-wic-border",
        };

  return (
    <div
      className={`flex flex-wrap gap-1.5 ${variant === "overlay" ? "mt-3" : "mt-2"}`}
    >
      {verdict.members.map((member) => (
        <span
          key={member.type}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            member.eligible ? styles.eligible : styles.ineligible
          }`}
        >
          <span>{member.eligible ? "✓" : "✕"}</span>
          <span>{member.label}</span>
        </span>
      ))}
    </div>
  );
}

function CardNote({ verdict }: { verdict: Verdict }) {
  const text =
    verdict.status === "approved" ? NO_HOUSEHOLD_NOTE : verdict.reason;
  if (!text) return null;

  const box =
    verdict.status === "approved"
      ? "bg-wic-border/40 border-wic-border/60 text-wic-text/80"
      : verdict.status === "ineligible"
        ? "bg-wic-ineligible-soft/50 border-wic-ineligible/30 text-wic-ineligible-ink"
        : "bg-wic-approved-soft/50 border-wic-approved/30 text-wic-approved-ink";
  const icon =
    verdict.status === "approved"
      ? "text-wic-text/60"
      : verdict.status === "ineligible"
        ? "text-wic-ineligible"
        : "text-wic-approved";

  return (
    <div className={`mt-2 p-4 rounded-xl border ${box}`}>
      <div className="flex gap-3">
        <Info
          className={`w-5 h-5 shrink-0 ${icon}`}
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <p className="text-sm font-medium leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function GuideList({ items, dot }: { items: string[]; dot: string }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-1.5 text-xs">
          <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${dot}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CompactGuide({ guide }: { guide: WicFoodSubCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const hiddenDoNotBuy = guide.doNotBuy.length - 3;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-semibold text-wic-approved-ink hover:text-wic-approved-ink/80 transition-colors"
      >
        <BookOpen className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        {isOpen ? "Hide Guide Info" : "View Guide Info"}
      </button>
      {isOpen && (
        <div className="mt-2 p-3 bg-black/40 rounded-lg border border-white/10 space-y-3 text-stone-300 animate-in fade-in slide-in-from-top-2 duration-200">
          {guide.doNotBuy.length > 0 && (
            <div>
              <div className="text-xs font-bold text-wic-error-ink uppercase tracking-wider mb-1.5">
                Do Not Buy
              </div>
              <GuideList
                items={guide.doNotBuy.slice(0, 3)}
                dot="bg-wic-error"
              />
              {hiddenDoNotBuy > 0 && (
                <div className="text-xs text-stone-400 pl-2.5 mt-1">
                  +{hiddenDoNotBuy} more
                </div>
              )}
            </div>
          )}
          {guide.approved.length > 0 && (
            <div>
              <div className="text-xs font-bold text-wic-approved-ink uppercase tracking-wider mb-1.5">
                Approved Sizes
              </div>
              <GuideList
                items={guide.approved.slice(0, 2)}
                dot="bg-wic-approved"
              />
            </div>
          )}
          {guide.shoppingTips.length > 0 && (
            <div>
              <div className="text-xs font-bold text-wic-tip-ink uppercase tracking-wider mb-1.5">
                Tip
              </div>
              <p className="text-xs">{guide.shoppingTips[0]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FullGuide({ guide }: { guide: WicFoodSubCategory }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2 border border-wic-sage/20 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-wic-sage/5 hover:bg-wic-sage/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen
            className="w-4 h-4 text-wic-sage"
            strokeWidth={2.5}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-wic-sage">
            WIC Guide: {guide.name}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-wic-sage transition-transform ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="p-4 space-y-3 text-wic-text/80 animate-in fade-in slide-in-from-top-2 duration-200">
          {guide.doNotBuy.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-wic-error-ink uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <X className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                Do Not Buy
              </h5>
              <GuideList items={guide.doNotBuy} dot="bg-wic-error" />
            </div>
          )}
          {guide.approved.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-wic-approved-ink uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                WIC Approved
              </h5>
              <GuideList items={guide.approved} dot="bg-wic-approved" />
            </div>
          )}
          {guide.shoppingTips.length > 0 && (
            <div className="bg-wic-tip-soft border border-wic-tip/20 rounded-lg p-3">
              <h5 className="text-xs font-bold text-wic-tip-ink uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                Shopping Tips
              </h5>
              <ul className="space-y-1">
                {guide.shoppingTips.map((tip) => (
                  <li key={tip} className="text-xs">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
