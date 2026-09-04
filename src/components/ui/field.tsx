import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-sm border border-border bg-surface-2 px-3.5 text-fg placeholder:text-fg-muted " +
  "transition-colors duration-150 hover:border-border-strong " +
  "focus:border-focus focus:outline-2 focus:outline-offset-2 focus:outline-focus " +
  "aria-invalid:border-danger disabled:opacity-40";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  /** Marks the label with an asterisk; the control still needs `required`. */
  required?: boolean;
  className?: string;
  /** Render prop receives the ids to wire the control. */
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

/** Label + control + hint/error wiring. Works in Server Components (useId is RSC-safe). */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
        {required ? (
          <span aria-hidden className="ml-1 text-accent">
            *
          </span>
        ) : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle aria-hidden className="size-4" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(control, "h-12", className)} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(control, "min-h-36 resize-y py-3", className)} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select {...props} className={cn(control, "h-12 appearance-none pr-10", className)} />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-fg-muted"
      />
    </div>
  );
}
