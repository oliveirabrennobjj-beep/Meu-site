import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bjork-ring-offset)]";

export const blockRoot =
  "@container relative isolate flex w-full overflow-clip bg-[var(--bjork-bg)] font-sans text-[14px] leading-normal text-[color:var(--bjork-text)] antialiased";

export const cardSurface =
  "rounded-[16px] border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] shadow-[var(--bjork-shadow-surface)]";

export const fieldClass =
  "w-full rounded-[11px] border border-[color:var(--bjork-border)] bg-[var(--bjork-field)] px-3 text-[14px] text-[color:var(--bjork-text)] outline-none placeholder:text-[color:var(--bjork-text-soft)] focus-visible:border-[color:var(--bjork-accent)] focus-visible:ring-[3px] focus-visible:ring-[color:var(--bjork-accent-soft)]";

/** Largura do elemento em px de layout (não muda quando um ancestral usa `transform: scale`). */
export function useElementWidth(ref: RefObject<HTMLElement>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

export function useBlockReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(query.matches);
    const onChange = () => setReduce(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

/** Região `aria-live` para avisar leitores de tela de mudanças que só aparecem visualmente. */
export function useAnnouncer() {
  const [message, setMessage] = useState("");
  const announce = useCallback((next: string) => {
    setMessage("");
    window.requestAnimationFrame(() => setMessage(next));
  }, []);
  const region = (
    <div className="sr-only" role="status" aria-live="polite">
      {message}
    </div>
  );
  return { announce, region };
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: "sm" | "md";
  pressed?: boolean;
};

export function IconButton({
  label,
  size = "md",
  pressed,
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        "relative inline-grid shrink-0 cursor-pointer place-items-center rounded-[9px] text-[color:var(--bjork-text-muted)] transition-colors duration-150 hover:bg-[var(--bjork-surface-hover)] hover:text-[color:var(--bjork-text)] disabled:pointer-events-none disabled:opacity-35 aria-pressed:text-[color:var(--bjork-text)]",
        size === "sm" ? "size-7 [&>svg]:size-[15px]" : "size-9 [&>svg]:size-[19px]",
        focusRing,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--blk-accent-fill)] text-[color:var(--blk-accent-fill-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(0,0,0,0.3)] hover:bg-[var(--bjork-accent-hover)]",
  secondary:
    "border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] text-[color:var(--bjork-text)] shadow-[var(--bjork-shadow-soft)] hover:bg-[var(--bjork-surface-hover)]",
  ghost:
    "text-[color:var(--bjork-text-medium)] hover:bg-[var(--bjork-surface-hover)] hover:text-[color:var(--bjork-text)]",
};

const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: "h-8 rounded-[9px] px-3 text-[13px] [&>svg]:size-[15px]",
  md: "h-10 rounded-[11px] px-4 text-[14px] [&>svg]:size-[16px]",
  lg: "h-[52px] rounded-[14px] px-5 text-[15.5px] [&>svg]:size-[18px]",
};

/** Classes de botão, para usar também em links (`<a>`) que precisam do mesmo visual. */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 motion-reduce:transition-none [&>svg]:shrink-0",
    BUTTON_VARIANT[variant],
    BUTTON_SIZE[size],
    focusRing,
    className,
  );
}

type BlockButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function BlockButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: BlockButtonProps) {
  return (
    <button type="button" className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

const SKIP_WORDS = new Set(["de", "da", "do", "das", "dos", "e", "a", "o"]);

export function InitialsAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const words = name
    .split(/\s+/)
    .filter((word) => /\p{L}|\d/u.test(word) && !SKIP_WORDS.has(word.toLowerCase()));
  const initials = (words[0]?.[0] ?? "?") + (words[1]?.[0] ?? "");
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.39) }}
      className="grid shrink-0 place-items-center rounded-full border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-surface-active)] font-medium uppercase leading-none text-[color:var(--bjork-text-medium)]"
    >
      {initials}
    </span>
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const EXIT_MS = 180;

/**
 * Painel modal que entra pela esquerda (navegação) ou por baixo (ficha).
 * Prende o foco, fecha com Esc ou toque fora, e devolve o foco ao fechar.
 */
export function BlockDrawer({
  open,
  onClose,
  label,
  side = "left",
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  side?: "left" | "bottom";
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useBlockReducedMotion();

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), reduce ? 0 : EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open, reduce]);

  useEffect(() => {
    if (!open || !mounted) return;
    const previous = document.activeElement as HTMLElement | null;
    // O painel ainda está fora da tela quando abre; sem isso o navegador rola a casca até ele.
    panelRef.current?.focus({ preventScroll: true });
    return () => previous?.focus?.();
  }, [open, mounted]);

  if (!mounted) return null;

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!items || items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const left = side === "left";
  return (
    <div className="absolute inset-0 z-40" onKeyDown={onKeyDown}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--blk-scrim)] transition-opacity duration-200 motion-reduce:transition-none"
        style={{
          opacity: open ? 1 : 0,
          animation: open && !reduce ? "blk-fade-in 200ms ease-out" : undefined,
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col bg-[var(--bjork-panel)] outline-none transition-transform ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          left
            ? "inset-y-0 left-0 w-[284px] max-w-[86%] border-r border-[color:var(--bjork-border)] duration-200"
            : "inset-x-0 bottom-0 max-h-[92%] rounded-t-[22px] border-t border-[color:var(--bjork-border-strong)] shadow-[var(--bjork-shadow-menu)] duration-200",
        )}
        style={{
          transform: open ? "none" : left ? "translateX(-100%)" : "translateY(100%)",
          animation:
            open && !reduce
              ? `${left ? "blk-slide-left" : "blk-slide-up"} 280ms cubic-bezier(0.32,0.72,0,1)`
              : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
