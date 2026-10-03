"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type SVGProps,
} from "react";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
} from "@/app/components/ui/icons";
import {
  getNotifications,
  getServerNotifications,
  notify,
  removeNotification,
  subscribeNotifications,
  type Notification,
  type NotifyType,
} from "@/lib/notify";

const EXIT_MS = 200;

/* Full class names so Tailwind can see them */
const STYLES: Record<
  NotifyType,
  {
    card: string;
    badge: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
  }
> = {
  success: {
    card: "bg-[#e9f1e6]",
    badge: "bg-[#cde3c8] text-corisio-blue",
    Icon: CheckCircleIcon,
  },
  error: {
    card: "bg-[#fbeaea]",
    badge: "bg-[#f5cccc] text-red-700",
    Icon: AlertCircleIcon,
  },
  warning: {
    card: "bg-[#fdf3df]",
    badge: "bg-[#f9e0aa] text-amber-700",
    Icon: AlertTriangleIcon,
  },
  info: {
    card: "bg-[#e8eff8]",
    badge: "bg-[#cbdcf1] text-sky-800",
    Icon: InfoIcon,
  },
};

function Toast({ item }: { item: Notification }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(item.duration);
  const { card, badge, Icon } = STYLES[item.type];

  // Auto close. Hovering or focusing the toast pauses the countdown.
  useEffect(() => {
    if (item.duration === 0 || item.closing || paused) return;

    const startedAt = Date.now();
    const timer = window.setTimeout(
      () => notify.dismiss(item.id),
      remaining.current,
    );

    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [item.id, item.duration, item.closing, paused]);

  // Remove it once the exit animation has played.
  useEffect(() => {
    if (!item.closing) return;
    const timer = window.setTimeout(() => removeNotification(item.key), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [item.closing, item.key]);

  return (
    <div
      role={item.type === "error" || item.type === "warning" ? "alert" : "status"}
      data-state={item.closing ? "closing" : "open"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`pointer-events-auto flex w-[360px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl p-4 shadow-sm ring-1 ring-black/5 transition-[transform,opacity] duration-200 ease-out translate-x-0 opacity-100 starting:translate-x-4 starting:opacity-0 data-[state=closing]:translate-x-4 data-[state=closing]:opacity-0 motion-reduce:transition-none ${card}`}
    >
      <span
        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${badge}`}
      >
        <Icon className="size-[18px]" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5 text-neutral-900">
          {item.title}
        </p>
        {item.message && (
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
            {item.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => notify.dismiss(item.id)}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 shrink-0 rounded-md p-1.5 text-neutral-600 transition hover:bg-black/5 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}

/**
 * Renders every notification sent through notify (app/lib/notify.ts).
 * Mounted once, in AppProviders.
 *
 * It's a manual popover so it lives in the browser's top layer: toasts stay
 * visible above open dialogs (e.g. the cart or sign-in drawer).
 *
 * Toasts sit at the top right. A page can move them down by setting the
 * --toast-top CSS variable on <html> (the admin shell does, to clear its top bar).
 */
export default function NotificationHost() {
  const items = useSyncExternalStore(
    subscribeNotifications,
    getNotifications,
    getServerNotifications,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== "function") return;
    try {
      if (!el.matches(":popover-open")) el.showPopover();
    } catch {
      // Falls back to plain fixed positioning
    }
  }, []);

  return (
    <div
      ref={ref}
      popover="manual"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-auto left-auto right-4 top-[var(--toast-top,1rem)] z-[1000] m-0 flex w-auto flex-col items-end gap-3 overflow-visible border-0 bg-transparent p-0 sm:right-8 sm:top-[var(--toast-top,1.5rem)]"
    >
      {items.map((item) => (
        <Toast key={item.key} item={item} />
      ))}
    </div>
  );
}
