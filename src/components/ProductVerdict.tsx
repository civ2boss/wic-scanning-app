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
        "bg-emerald-900/90 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      warning:
        "bg-amber-900/90 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]",
      negative:
        "bg-red-900/90 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]",
    },
    heading: {
      positive: "text-emerald-200",
      warning: "text-amber-200",
      negative: "text-red-200",
    },
    iconBubble: {
      positive: "bg-emerald-500/20",
      warning: "bg-amber-500/20",
      negative: "bg-red-500/20",
    },
    icon: {
      positive: "text-emerald-400",
      warning: "text-amber-400",
      negative: "text-red-400",
    },
  },
  card: {
    panel: {
      positive: "border-emerald-500/30",
      warning: "border-amber-500/30",
      negative: "border-red-500/30",
    },
    band: {
      positive: "bg-emerald-50",
      warning: "bg-amber-50",
      negative: "bg-red-50",
    },
    heading: {
      positive: "text-emerald-800",
      warning: "text-amber-800",
      negative: "text-red-800",
    },
    iconBubble: {
      positive: "bg-emerald-200/50",
      warning: "bg-amber-200/50",
      negative: "bg-red-200/50",
    },
    icon: {
      positive: "text-emerald-600",
      warning: "text-amber-600",
      negative: "text-red-600",
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
    return (
      <div
        className={`p-5 rounded-2xl shadow-2xl backdrop-blur-md border transform transition-all duration-300 ${s.panel[tone]}`}
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
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50">
        <Check className="w-2.5 h-2.5" strokeWidth={3} aria-hidden="true" />
        APPROVED
      </span>
    );
  }
  if (status === "ineligible") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/50">
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
          eligible: "bg-emerald-500/20 text-emerald-100 border-emerald-400/40",
          ineligible: "bg-black/30 text-white/60 border-white/15",
        }
      : {
          eligible: "bg-emerald-50 text-emerald-800 border-emerald-200",
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
        ? "bg-amber-50/50 border-amber-200 text-amber-900"
        : "bg-emerald-50/50 border-emerald-200 text-emerald-900";
  const icon =
    verdict.status === "approved"
      ? "text-wic-text/60"
      : verdict.status === "ineligible"
        ? "text-amber-500"
        : "text-emerald-500";

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
        className="flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
      >
        <BookOpen className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        {isOpen ? "Hide Guide Info" : "View Guide Info"}
      </button>
      {isOpen && (
        <div className="mt-2 p-3 bg-black/40 rounded-lg border border-white/10 space-y-3 text-stone-300 animate-in fade-in slide-in-from-top-2 duration-200">
          {guide.doNotBuy.length > 0 && (
            <div>
              <div className="text-xs font-bold text-red-300 uppercase tracking-wider mb-1.5">
                Do Not Buy
              </div>
              <GuideList items={guide.doNotBuy.slice(0, 3)} dot="bg-red-400" />
              {hiddenDoNotBuy > 0 && (
                <div className="text-xs text-stone-400 pl-2.5 mt-1">
                  +{hiddenDoNotBuy} more
                </div>
              )}
            </div>
          )}
          {guide.approved.length > 0 && (
            <div>
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                Approved Sizes
              </div>
              <GuideList
                items={guide.approved.slice(0, 2)}
                dot="bg-emerald-400"
              />
            </div>
          )}
          {guide.shoppingTips.length > 0 && (
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
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
              <h5 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <X className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                Do Not Buy
              </h5>
              <GuideList items={guide.doNotBuy} dot="bg-red-500" />
            </div>
          )}
          {guide.approved.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                WIC Approved
              </h5>
              <GuideList items={guide.approved} dot="bg-emerald-500" />
            </div>
          )}
          {guide.shoppingTips.length > 0 && (
            <div className="bg-wic-yellow/10 border border-wic-yellow/20 rounded-lg p-3">
              <h5
                className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1"
                style={{ color: "#CCA25F" }}
              >
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
