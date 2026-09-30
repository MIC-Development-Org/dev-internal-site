import { cn } from "@/lib/utils";

/** Inline validation message for a form field. Pair the input with `aria-describedby={`${id}-error`}`. */
export function FieldError({ id, message, className }: { id: string; message?: string; className?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} role="alert" className={cn("text-[11px] text-destructive", className)}>
      {message}
    </p>
  );
}
