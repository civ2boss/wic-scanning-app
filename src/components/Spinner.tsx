import { LoaderCircle } from "lucide-react";

interface SpinnerProps {
  className?: string;
  /** Announced to screen readers. Omit when visible text already describes the loading state. */
  label?: string;
}

export function Spinner({ className = "w-5 h-5", label }: SpinnerProps) {
  const icon = (
    <LoaderCircle
      className={`animate-spin ${className}`}
      strokeWidth={2.5}
      aria-hidden="true"
    />
  );

  if (!label) return icon;

  return (
    <output aria-label={label} className="inline-flex">
      {icon}
    </output>
  );
}
