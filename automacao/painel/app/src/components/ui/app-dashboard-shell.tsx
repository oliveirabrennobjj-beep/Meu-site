import {
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type RefObject,
  type SVGProps,
} from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import {
  BlockDrawer,
  IconButton,
  InitialsAvatar,
  blockRoot,
  focusRing,
  useElementWidth,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";

export interface ShellNavItem {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
}

export interface ShellNavGroup {
  label?: string;
  items: ShellNavItem[];
}

export interface AppDashboardShellProps {
  workspace: { name: string; plan: string; mark: ReactNode };
  user: { name: string; detail: string };
  nav: ShellNavGroup[];
  active: string;
  onNavigate: (id: string) => void;
  /** Texto do item atual na trilha do cabeçalho. */
  title: string;
  headerActions?: ReactNode;
  /** Cartão acima da conta, na barra lateral aberta. */
  sidebarFooter?: ReactNode;
  mainRef?: RefObject<HTMLElement>;
  /** Camadas por cima de tudo (fichas, avisos). */
  overlay?: ReactNode;
  children: ReactNode;
  className?: string;
}

const DRAWER_BELOW = 768;

/**
 * Casca de painel: barra lateral que vira gaveta em telas estreitas, cabeçalho com trilha e ações,
 * e uma área principal com rolagem própria.
 */
export function AppDashboardShell({
  workspace,
  user,
  nav,
  active,
  onNavigate,
  title,
  headerActions,
  sidebarFooter,
  mainRef,
  overlay,
  children,
  className,
}: AppDashboardShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(rootRef);
  const narrow = width > 0 && width < DRAWER_BELOW;
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = (id: string) => {
    onNavigate(id);
    setDrawerOpen(false);
  };

  const sidebar = (mode: "rail" | "drawer") => (
    <SidebarContent
      mode={mode}
      collapsed={mode === "rail" && collapsed}
      workspace={workspace}
      user={user}
      nav={nav}
      active={active}
      footer={sidebarFooter}
      onNavigate={navigate}
      onToggleCollapsed={() => setCollapsed((value) => !value)}
      onClose={() => setDrawerOpen(false)}
    />
  );

  return (
    <div ref={rootRef} className={cn(blockRoot, "h-full", className)}>
      {!narrow && (
        <aside
          aria-label="Lateral"
          className={cn(
            "relative z-20 flex h-full shrink-0 flex-col border-r border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] transition-[width] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            collapsed ? "w-[64px]" : "w-[244px]",
          )}
        >
          {sidebar("rail")}
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[color:var(--bjork-border)] px-3 @3xl:px-5">
          {narrow && (
            <IconButton
              label="Abrir menu"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
            >
              <Menu />
            </IconButton>
          )}
          <nav aria-label="Você está em" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
              <li className="hidden truncate text-[color:var(--bjork-text-muted)] @md:block">
                {workspace.name}
              </li>
              <li
                aria-hidden="true"
                className="hidden text-[color:var(--bjork-text-faint)] @md:block"
              >
                /
              </li>
              <li
                aria-current="page"
                className="truncate font-medium text-[color:var(--bjork-text)]"
              >
                {title}
              </li>
            </ol>
          </nav>
          <div className="ml-auto flex items-center gap-1.5">{headerActions}</div>
        </header>

        <main
          ref={mainRef}
          className="@container/main min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {children}
        </main>
      </div>

      {narrow && (
        <BlockDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} label="Menu">
          {sidebar("drawer")}
        </BlockDrawer>
      )}
      {overlay}
    </div>
  );
}

function SidebarContent({
  mode,
  collapsed,
  workspace,
  user,
  nav,
  active,
  footer,
  onNavigate,
  onToggleCollapsed,
  onClose,
}: {
  mode: "rail" | "drawer";
  collapsed: boolean;
  workspace: AppDashboardShellProps["workspace"];
  user: AppDashboardShellProps["user"];
  nav: ShellNavGroup[];
  active: string;
  footer?: ReactNode;
  onNavigate: (id: string) => void;
  onToggleCollapsed: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-b border-[color:var(--bjork-border)]",
          collapsed ? "justify-center px-2" : "px-3",
        )}
      >
        <div
          className={cn("flex min-w-0 flex-1 items-center gap-2.5 p-1.5", collapsed && "flex-none")}
          title={collapsed ? workspace.name : undefined}
        >
          {workspace.mark}
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold leading-tight">
                {workspace.name}
              </span>
              <span className="block truncate text-[11.5px] leading-tight text-[color:var(--bjork-text-muted)]">
                {workspace.plan}
              </span>
            </span>
          )}
        </div>
        {mode === "drawer" && (
          <IconButton label="Fechar menu" onClick={onClose}>
            <X />
          </IconButton>
        )}
      </div>

      <nav
        aria-label="Principal"
        className={cn("hide-scrollbar flex-1 overflow-y-auto py-3", collapsed ? "px-2" : "px-2.5")}
      >
        {nav.map((group, groupIndex) => (
          <div key={group.label ?? groupIndex} className={cn(groupIndex > 0 && "mt-5")}>
            {group.label &&
              (collapsed ? (
                <div
                  aria-hidden="true"
                  className="mx-auto mb-2 h-px w-6 bg-[var(--bjork-border)]"
                />
              ) : (
                <h2 className="mb-1.5 px-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--bjork-text-soft)]">
                  {group.label}
                </h2>
              ))}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = item.id === active;
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        onNavigate(item.id);
                      }}
                      aria-current={isActive ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex h-10 items-center gap-2.5 rounded-[9px] text-[13.5px] transition-colors duration-150",
                        collapsed ? "justify-center px-0" : "px-2.5",
                        isActive
                          ? "bg-[var(--bjork-surface)] font-medium text-[color:var(--bjork-text)] shadow-[var(--bjork-shadow-soft),0_0_0_1px_var(--bjork-border)]"
                          : "text-[color:var(--bjork-text-medium)] hover:bg-[var(--bjork-surface-hover)] hover:text-[color:var(--bjork-text)]",
                        focusRing,
                      )}
                    >
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute -left-2.5 top-2.5 h-5 w-[3px] rounded-r-full bg-[var(--bjork-accent)]"
                        />
                      )}
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          "size-[17px] shrink-0",
                          isActive
                            ? "text-[color:var(--blk-accent-ink)]"
                            : "text-[color:var(--bjork-text-muted)] group-hover:text-[color:var(--bjork-text-medium)]",
                        )}
                      />
                      {collapsed ? (
                        <span className="sr-only">{item.label}</span>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-[6px] bg-[var(--bjork-surface-active)] px-1.5 py-px font-mono text-[11px] tabular-nums text-[color:var(--bjork-text-muted)]">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-[color:var(--bjork-border)] p-2.5",
          collapsed && "px-2",
        )}
      >
        {!collapsed && footer}
        <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
          <div
            className={cn(
              "flex min-w-0 items-center gap-2.5 p-1.5",
              collapsed ? "flex-none" : "flex-1",
            )}
          >
            <InitialsAvatar name={user.name} size={28} />
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium leading-tight">
                  {user.name}
                </span>
                <span className="block truncate text-[11.5px] leading-tight text-[color:var(--bjork-text-muted)]">
                  {user.detail}
                </span>
              </span>
            )}
          </div>
          {mode === "rail" && (
            <IconButton
              label={collapsed ? "Abrir barra lateral" : "Recolher barra lateral"}
              size="sm"
              onClick={onToggleCollapsed}
              aria-expanded={!collapsed}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </IconButton>
          )}
        </div>
      </div>
    </>
  );
}

export default AppDashboardShell;
