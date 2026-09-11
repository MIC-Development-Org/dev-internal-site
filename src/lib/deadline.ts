export function isDeadlinePassed(deadline: Date | null | undefined) {
  return !!deadline && deadline.getTime() < Date.now();
}
