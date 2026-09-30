/** Result of a server action used with `useActionState`. */
export type ActionState = {
  /** Summary message (shown as a toast when there are no field-level errors). */
  error?: string;
  success?: boolean;
  /** Per-field messages keyed by the form input's `name`, shown inline under each input. */
  fieldErrors?: Record<string, string>;
};

/** Failure tied to one or more form fields. `error` mirrors the first message for toast/fallback use. */
export function fieldErrors(errors: Record<string, string>): ActionState {
  const first = Object.values(errors)[0];
  return { error: first, fieldErrors: errors };
}

export function fieldError(field: string, message: string): ActionState {
  return fieldErrors({ [field]: message });
}
