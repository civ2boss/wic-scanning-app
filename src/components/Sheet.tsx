import { Search, X } from "lucide-react";
import {
  type ReactNode,
  type RefObject,
  type UIEvent,
  useEffect,
  useId,
  useRef,
} from "react";

type SheetVariant = "page" | "drawer" | "camera";

interface SheetProps {
  title: string;
  onClose: () => void;
  variant?: SheetVariant;
  closeLabel?: string;
  /** Receives focus on open; defaults to the dialog itself. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** `page` only: rows under the title, such as a SearchField. */
  header?: ReactNode;
  /** `camera` only: controls opposite the close button. */
  actions?: ReactNode;
  /** `drawer` only: pinned below the content. */
  footer?: ReactNode;
  /** `page` only: the scrolling body. */
  bodyRef?: RefObject<HTMLDivElement | null>;
  onBodyScroll?: (event: UIEvent<HTMLDivElement>) => void;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const CLOSE_BUTTON_CLASS: Record<SheetVariant, string> = {
  page: "w-10 h-10 flex items-center justify-center bg-wic-bg rounded-full text-wic-text/60 hover:text-wic-text hover:bg-wic-border transition-colors active:scale-95",
  drawer:
    "p-2 -mr-2 text-wic-text/60 hover:text-wic-text rounded-full hover:bg-wic-border/50 transition-colors",
  camera:
    "p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors active:scale-95",
};

const CLOSE_ICON_CLASS: Record<SheetVariant, string> = {
  page: "w-5 h-5",
  drawer: "w-6 h-6",
  camera: "w-6 h-6",
};

function useModalDialog(
  dialogRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per open so the opener and scroll state are captured before the sheet takes over.
  useEffect(() => {
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    (initialFocusRef?.current ?? dialogRef.current)?.focus({
      preventScroll: true,
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (event.defaultPrevented) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isInside = active instanceof Node && dialog.contains(active);
      const shouldWrap = event.shiftKey
        ? !isInside || active === first || active === dialog
        : !isInside || active === last;
      if (shouldWrap) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dialogRef]);
}

/**
 * Full-screen overlay that owns modal dialog behaviour: labelled
 * `role="dialog"`, Escape to close, Tab focus trap, focus restored to the
 * opener, body scroll lock and the close button.
 */
export function Sheet({
  title,
  onClose,
  variant = "page",
  closeLabel = "Close",
  initialFocusRef,
  header,
  actions,
  footer,
  bodyRef,
  onBodyScroll,
  children,
}: SheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalDialog(dialogRef, onClose, initialFocusRef);

  const dialogProps = {
    ref: dialogRef,
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": titleId,
    tabIndex: -1,
  } as const;

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      className={CLOSE_BUTTON_CLASS[variant]}
      aria-label={closeLabel}
    >
      <X
        className={CLOSE_ICON_CLASS[variant]}
        strokeWidth={variant === "page" ? 2.5 : 2}
        aria-hidden="true"
      />
    </button>
  );

  if (variant === "drawer") {
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click is a pointer shortcut; Escape is the keyboard equivalent.
      // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is handled at document level.
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end transition-opacity"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          {...dialogProps}
          className="bg-wic-bg w-full max-w-md h-full shadow-2xl border-l border-wic-border p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 outline-none"
        >
          <div className="space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-wic-border">
              <h2
                id={titleId}
                className="text-2xl font-serif font-bold text-wic-text"
              >
                {title}
              </h2>
              {closeButton}
            </div>
            {children}
          </div>
          {footer}
        </div>
      </div>
    );
  }

  if (variant === "camera") {
    return (
      <div
        {...dialogProps}
        className="fixed inset-0 z-50 bg-black text-white animate-in slide-in-from-bottom-full duration-300 outline-none"
      >
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 bg-linear-to-b from-black/70 to-transparent pb-8">
          {closeButton}
          {actions}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      {...dialogProps}
      className="fixed inset-0 z-50 bg-wic-bg/95 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl overflow-hidden text-wic-text outline-none"
    >
      <div className="pt-12 pb-4 px-6 bg-wic-card shadow-sm border-b border-wic-border flex flex-col gap-4 relative z-20 shrink-0 rounded-b-[2rem]">
        <div className="flex justify-between items-center">
          <h2
            id={titleId}
            className="text-xl font-serif font-bold text-wic-sage"
          >
            {title}
          </h2>
          {closeButton}
        </div>
        {header}
      </div>
      <div
        ref={bodyRef}
        onScroll={onBodyScroll}
        className="flex-1 overflow-y-auto z-10 p-6 bg-wic-bg relative"
      >
        {children}
      </div>
    </div>
  );
}

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function SearchField({
  value,
  onChange,
  onClear,
  placeholder,
  inputRef,
}: SearchFieldProps) {
  const ownRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? ownRef;

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-4 z-10 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-wic-text/40" aria-hidden="true" />
      </div>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-4 bg-wic-bg border-2 border-wic-border focus:border-wic-sage rounded-2xl outline-none text-base placeholder:text-wic-text/40 font-medium transition-colors shadow-inner drop-shadow-sm"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onClear();
            ref.current?.focus();
          }}
          className="absolute inset-y-0 right-4 flex items-center justify-center text-wic-text/40 hover:text-wic-text/80 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4.5 h-4.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function BackLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm font-semibold text-wic-text/60 hover:text-wic-text mb-6 pl-1 transition-colors w-max"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
      </svg>
      {children}
    </button>
  );
}

const EMPTY_STATE_ICON_CLASS = {
  sage: "bg-wic-sage/10 text-wic-sage",
  terracotta: "bg-wic-terracotta/10 text-wic-terracotta",
};

export function EmptyState({
  icon,
  title,
  tone = "terracotta",
  children,
}: {
  icon: ReactNode;
  title: string;
  /** `sage` is a dimmed prompt to start; `terracotta` means nothing matched. */
  tone?: keyof typeof EMPTY_STATE_ICON_CLASS;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 gap-3 text-center${tone === "sage" ? " opacity-60" : ""}`}
    >
      <div
        className={`w-16 h-16 ${EMPTY_STATE_ICON_CLASS[tone]} rounded-full flex items-center justify-center mb-2`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-wic-text text-lg">{title}</h3>
      {children}
    </div>
  );
}
