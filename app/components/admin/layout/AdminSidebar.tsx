"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav, isNavActive, type AdminNavItem } from "@/app/config/admin";
import { siteConfig } from "@/app/config/site";
import AdminIcon from "./AdminIcon";
import useAdminSignOut from "./useAdminSignOut";


const HIDE_WHEN_COLLAPSED = "lg:group-data-[collapsed=true]/side:hidden";

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: AdminNavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  const className = `flex h-[42px] items-center gap-3 rounded-xl px-5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue lg:group-data-[collapsed=true]/side:justify-center lg:group-data-[collapsed=true]/side:px-0 ${
    active
      ? "bg-corisio-blue font-medium text-white"
      : "text-neutral-700 hover:bg-neutral-50"
  }`;

  const content = (
    <>
      <AdminIcon name={item.icon} className="size-[18px] shrink-0" />
      <span className={`truncate ${HIDE_WHEN_COLLAPSED}`}>{item.label}</span>
      {item.badge !== undefined && (
        <span
          className={`rounded-full bg-[#ededed] px-2 py-0.5 text-xs font-normal text-neutral-500 ${HIDE_WHEN_COLLAPSED}`}
        >
          {item.badge}
        </span>
      )}
      {item.external && (
        <AdminIcon
          name="external"
          className={`ml-auto size-4 shrink-0 text-neutral-600 ${HIDE_WHEN_COLLAPSED}`}
        />
      )}
    </>
  );

  if (item.external) {
    return (
      <Link
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        title={item.label}
        onClick={onNavigate}
        className={className}
      >
        {content}
        <span className="sr-only">(opens in a new tab)</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={className}
    >
      {content}
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <>
      <p className={`mb-3 text-[13px] text-neutral-400 ${HIDE_WHEN_COLLAPSED}`}>
        {children}
      </p>
      <hr className="mx-auto my-4 hidden w-8 border-neutral-200 lg:group-data-[collapsed=true]/side:block" />
    </>
  );
}

export default function AdminSidebar({
  collapsed,
  open,
  onClose,
}: {
  collapsed: boolean;
  /** Mobile drawer state */
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { signOut, loading } = useAdminSignOut();

  return (
    <aside
      id="admin-sidebar"
      aria-label="Admin navigation"
      data-collapsed={collapsed}
      className={`group/side fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-white transition-[transform,visibility,width] duration-200 motion-reduce:transition-none lg:static lg:z-auto lg:w-[266px] lg:translate-x-0 lg:visible lg:data-[collapsed=true]:w-[88px] ${
        open ? "translate-x-0" : "invisible -translate-x-full"
      }`}
    >
      {/* Drawer header (small screens only; on desktop the top bar has the logo) */}
      <div className="flex h-[76px] shrink-0 items-center justify-between px-6 lg:hidden">
        <Image
          src="/logo-horizontal.png"
          alt={siteConfig.name}
          width={130}
          height={42}
          className="h-10 w-auto"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-corisio-blue"
        >
          <AdminIcon name="close" className="size-5" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-8 pb-4 pt-3 lg:pt-10 lg:group-data-[collapsed=true]/side:px-4">
        <SectionLabel>Core Services</SectionLabel>
        <ul className="space-y-1">
          {adminNav.core.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={isNavActive(pathname, item.href)}
                onNavigate={onClose}
              />
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <SectionLabel>Features</SectionLabel>
          <ul className="space-y-1">
            {adminNav.features.map((item) => (
              <li key={item.href}>
                <NavLink item={item} active={false} onNavigate={onClose} />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="shrink-0 space-y-1 px-8 pb-8 pt-2 lg:group-data-[collapsed=true]/side:px-4">
        <NavLink
          item={adminNav.settings}
          active={isNavActive(pathname, adminNav.settings.href)}
          onNavigate={onClose}
        />

        <button
          type="button"
          onClick={signOut}
          disabled={loading}
          title="Log Out"
          className="flex h-[42px] w-full items-center gap-3 rounded-xl bg-[#fceceb] px-5 text-sm text-[#e5484d] transition-colors hover:bg-[#fadedc] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e5484d] lg:group-data-[collapsed=true]/side:justify-center lg:group-data-[collapsed=true]/side:px-0"
        >
          <AdminIcon name="logout" className="size-[18px] shrink-0" />
          <span className={HIDE_WHEN_COLLAPSED}>
            {loading ? "Logging out..." : "Log Out"}
          </span>
        </button>
      </div>
    </aside>
  );
}
