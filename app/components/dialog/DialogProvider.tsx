"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type DialogSide = "right" | "left" | "center";
export type DialogWidth = "sm" | "md" | "lg" | "xl" | "2xl";

export type DialogOptions = {
  /** Accessible name announced by screen readers. */
  title?: string;
  /** Where the dialog sits. Default: "right" (a drawer stuck to the right). */
  side?: DialogSide;
  /** Panel width. Default: "md". */
  width?: DialogWidth;
  /** Allow closing with Esc or by clicking outside. Default: true. */
  dismissible?: boolean;
  /** Called after the dialog has finished closing. */
  onClose?: () => void;
};

/** Any element, or a function that receives a `close` helper. */
export type DialogContent =
  | ReactNode
  | ((api: { close: () => void }) => ReactNode);

type DialogContextValue = {
  openDialog: (content: DialogContent, options?: DialogOptions) => void;
  closeDialog: () => void;
  isOpen: boolean;
};

type ActiveDialog = {
  id: number;
  content: DialogContent;
  options: DialogOptions;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used inside <DialogProvider>.");
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Styles (full class names so Tailwind can see them)                  */
/* ------------------------------------------------------------------ */

const EXIT_MS = 220;

const SIDE_LAYOUT: Record<DialogSide, string> = {
  right: "justify-end",
  left: "justify-start",
  center: "items-center justify-center p-4",
};

const PANEL_SHAPE: Record<DialogSide, string> = {
  right:
    "h-full w-full translate-x-0 starting:translate-x-full data-[state=closing]:translate-x-full",
  left:
    "h-full w-full translate-x-0 starting:-translate-x-full data-[state=closing]:-translate-x-full",
  center:
    "max-h-[90dvh] w-full overflow-y-auto rounded-2xl scale-100 opacity-100 starting:scale-95 starting:opacity-0 data-[state=closing]:scale-95 data-[state=closing]:opacity-0",
};

const PANEL_WIDTH: Record<DialogSide, Record<DialogWidth, string>> = {
  right: {
    sm: "sm:w-[380px]",
    md: "sm:w-[420px]",
    lg: "sm:w-[520px]",
    xl: "sm:w-[620px]",
    "2xl": "sm:w-[720px]",
  },
  left: {
    sm: "sm:w-[380px]",
    md: "sm:w-[420px]",
    lg: "sm:w-[520px]",
    xl: "sm:w-[620px]",
    "2xl": "sm:w-[720px]",
  },
  center: {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-[760px]",
    "2xl": "max-w-[1180px]",
  },
};

/* ------------------------------------------------------------------ */
/* The dialog element                                                  */
/* ------------------------------------------------------------------ */

function DialogShell({
  dialog,
  closing,
  onRequestClose,
  onClosed,
}: {
  dialog: ActiveDialog;
  closing: boolean;
  onRequestClose: () => void;
  onClosed: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOnBackdrop = useRef(false);

  const { content, options } = dialog;
  const side = options.side ?? "right";
  const width = options.width ?? "md";
  const dismissible = options.dismissible ?? true;

  // Open as a modal (focus trap, Esc, inert page) and lock page scroll.
  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    return () => {
      root.style.overflow = previousOverflow;
    };
  }, []);

  // Wait for the exit animation, then really close (which restores focus).
  useEffect(() => {
    if (!closing) return;

    const timer = window.setTimeout(() => {
      ref.current?.close();
      options.onClose?.();
      onClosed();
    }, EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [closing, onClosed, options]);

  const body =
    typeof content === "function"
      ? content({ close: onRequestClose })
      : content;

  return (
    <dialog
      ref={ref}
      aria-label={options.title ?? "Dialog"}
      data-state={closing ? "closing" : "open"}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onRequestClose();
      }}
      onMouseDown={(e) => {
        pressedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (
          dismissible &&
          pressedOnBackdrop.current &&
          e.target === e.currentTarget
        ) {
          onRequestClose();
        }
      }}
      className={`fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-black/50 text-neutral-900 transition-opacity duration-200 backdrop:bg-transparent open:flex starting:opacity-0 motion-reduce:transition-none data-[state=closing]:opacity-0 ${SIDE_LAYOUT[side]}`}
    >
      <div
        data-state={closing ? "closing" : "open"}
        className={`bg-white shadow-2xl transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${PANEL_SHAPE[side]} ${PANEL_WIDTH[side][width]}`}
      >
        {body}
      </div>
    </dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ActiveDialog | null>(null);
  const [closing, setClosing] = useState(false);
  const nextId = useRef(0);

  // Opening a dialog while another is open replaces it.
  const openDialog = useCallback(
    (content: DialogContent, options: DialogOptions = {}) => {
      nextId.current += 1;
      setClosing(false);
      setDialog({ id: nextId.current, content, options });
    },
    [],
  );

  const closeDialog = useCallback(() => setClosing(true), []);

  const handleClosed = useCallback(() => {
    setDialog(null);
    setClosing(false);
  }, []);

  const value = useMemo<DialogContextValue>(
    () => ({
      openDialog,
      closeDialog,
      isOpen: dialog !== null && !closing,
    }),
    [openDialog, closeDialog, dialog, closing],
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialog && (
        <DialogShell
          key={dialog.id}
          dialog={dialog}
          closing={closing}
          onRequestClose={closeDialog}
          onClosed={handleClosed}
        />
      )}
    </DialogContext.Provider>
  );
}
