
export type NotifyType = "success" | "error" | "warning" | "info";

export type Notification = {
  key: string;
  id: string;
  type: NotifyType;
  title: string;
  message?: string;
  duration: number;
  closing: boolean;
};

export type NotifyOptions = {
  message?: string;
  duration?: number;
  id?: string;
};

const DEFAULT_DURATION = 5000;
const ERROR_DURATION = 7000;
const MAX_VISIBLE = 4;

/* ------------------------------------------------------------------ */
/* Tiny external store (read by <NotificationHost /> via               */
/* useSyncExternalStore)                                               */
/* ------------------------------------------------------------------ */

const EMPTY: Notification[] = [];
let state: Notification[] = EMPTY;
let counter = 0;
const listeners = new Set<() => void>();

function set(next: Notification[]) {
  state = next.length === 0 ? EMPTY : next;
  listeners.forEach((l) => l());
}

export const subscribeNotifications = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const getNotifications = () => state;
export const getServerNotifications = () => EMPTY;

/** Removes a toast for good (called by the host after its exit animation). */
export function removeNotification(key: string) {
  set(state.filter((n) => n.key !== key));
}

function dismiss(id: string) {
  if (!state.some((n) => n.id === id && !n.closing)) return;
  set(state.map((n) => (n.id === id ? { ...n, closing: true } : n)));
}

function clear() {
  if (state.length === 0) return;
  set(state.map((n) => ({ ...n, closing: true })));
}

function push(
  type: NotifyType,
  title: string,
  options: string | NotifyOptions = {},
): string {
  const opts: NotifyOptions =
    typeof options === "string" ? { message: options } : options;

  counter += 1;
  const id = opts.id ?? `notification-${counter}`;

  if (typeof window === "undefined") return id;

  const toast: Notification = {
    key: `${id}-${counter}`,
    id,
    type,
    title,
    message: opts.message,
    duration:
      opts.duration ?? (type === "error" ? ERROR_DURATION : DEFAULT_DURATION),
    closing: false,
  };

  // A toast with the same id is replaced, so repeated calls don't pile up
  set([...state.filter((n) => n.id !== id), toast].slice(-MAX_VISIBLE));
  return id;
}

export const notify = Object.assign(
  (title: string, options?: string | NotifyOptions) =>
    push("info", title, options),
  {
    success: (title: string, options?: string | NotifyOptions) =>
      push("success", title, options),
    error: (title: string, options?: string | NotifyOptions) =>
      push("error", title, options),
    warning: (title: string, options?: string | NotifyOptions) =>
      push("warning", title, options),
    info: (title: string, options?: string | NotifyOptions) =>
      push("info", title, options),
    dismiss,
    clear,
  },
);
