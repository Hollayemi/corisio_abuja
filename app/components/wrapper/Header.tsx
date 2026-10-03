"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AccountButton, { HeaderIconLink } from "@/app/components/ui/AccountButton";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import useOpenCart from "@/app/components/cart/useOpenCart";
import { useCartCount } from "@/redux/hooks";
import {
  BagIcon,
  BoltIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  socialIcons,
} from "../ui/icons";
import { siteConfig } from "@/app/config/site";

const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6";

function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`flex h-11 w-full items-center rounded-lg bg-white/10 focus-within:ring-2 focus-within:ring-corisio-yellow/70 ${className}`}
    >
      <div className="relative flex h-full shrink-0 items-center">
        <select
          aria-label="Search category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-full w-[118px] appearance-none truncate bg-transparent pl-4 pr-7 text-[11px] text-white focus:outline-none"
        >
          {siteConfig.categories.map((c) => (
            <option key={c.slug} value={c.slug} className="text-black">
              {c.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2.5 h-3.5 w-3.5" />
      </div>

      <span aria-hidden="true" className="h-5 w-px bg-white/25" />

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a product or store..."
        aria-label="Search for a product or store"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-[11px] text-white placeholder:text-white/60 focus:outline-none"
      />

      <button
        type="submit"
        aria-label="Search"
        className="flex h-full items-center px-4 text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:text-corisio-yellow"
      >
        <SearchIcon className="h-4 w-4" />
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Nav links                                                           */
/* ------------------------------------------------------------------ */

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLinks({
  pathname,
  vertical = false,
  onNavigate,
  signedIn = false,
}: {
  pathname: string;
  vertical?: boolean;
  onNavigate?: () => void;
  signedIn?: boolean;
}) {
  // For signed-in users, surface discovery-first destinations before orders.
  const items = signedIn
    ? [
        { label: "Nearby", href: "/nearby" },
        { label: "Saved Stores", href: "/saved" },
        { label: "My Orders", href: "/orders" },
        ...siteConfig.nav.filter((i) => i.href !== "/"),
      ]
    : siteConfig.nav;

  return (
    <nav aria-label="Main">
      <ul className={vertical ? "flex flex-col gap-1" : "flex items-center gap-8"}>
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-corisio-yellow ${
                  vertical ? "block rounded-md px-2 py-2.5" : ""
                } ${active ? "text-corisio-yellow" : "text-white hover:text-corisio-yellow"}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

export default function Header() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const openCart = useOpenCart();
  const openAuth = useOpenAuth();
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  const browseButton = (
    <Link
      href="/search"
      onClick={closeMenu}
      className="inline-flex h-11 items-center gap-2.5 rounded-lg bg-corisio-yellow px-5 text-xs font-medium text-black transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <MenuIcon className="h-4 w-4" />
      Browse Stores
    </Link>
  );

  const flashSales = (
    <Link
      href="/flash-sales"
      onClick={closeMenu}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-corisio-yellow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-corisio-yellow"
    >
      <BoltIcon className="h-4 w-4" />
      Flash Sales
    </Link>
  );

  return (
    <header className="w-full fixed top-0 z-50">
      {/* Top promo bar */}
      <div className="bg-corisio-yellow text-xs text-black sm:text-[13px]">
        <div
          className={`${container} grid items-center gap-x-4 py-2.5 md:grid-cols-[1fr_auto_1fr]`}
        >
          <a
            href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
            className="hidden hover:underline md:block"
          >
            Call Us: {siteConfig.phone}
          </a>

          <p className="text-center">
            {siteConfig.promo.text}{" "}
            {status !== "authenticated" && (
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="font-medium text-corisio-blue underline underline-offset-2"
              >
                {siteConfig.promo.linkLabel}
              </button>
            )}
          </p>

          <ul className="hidden items-center gap-3.5 justify-self-end text-corisio-blue md:flex">
            {siteConfig.socials.map((s) => {
              const Icon = socialIcons[s.icon];
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="block transition hover:opacity-70"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-corisio-blue text-white">
        <div className={container}>
          {/* Row 1: logo / search / actions */}
          <div className="flex items-center justify-between gap-3 py-4 lg:grid lg:grid-cols-[1fr_minmax(0,460px)_1fr] lg:gap-6">
            <Link
              href="/"
              aria-label={`${siteConfig.name} home`}
              className="shrink-0 justify-self-start"
            >
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={130}
                height={52}
                priority
                className="h-11 w-auto"
              />
            </Link>

            <SearchBar className="hidden lg:flex" />

            <div className="flex items-center gap-2.5 lg:justify-self-end">
              {signedIn && (
                <>
                  <HeaderIconLink href="/wishlist" label="Wishlist" icon="heart" />
                  <HeaderIconLink href="/loyalty" label="Loyalty points" icon="gem" />
                  <div className="hidden sm:block">
                    <AccountButton />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={openCart}
                aria-haspopup="dialog"
                aria-label={
                  cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"
                }
                className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-corisio-yellow bg-corisio-yellow/15 text-corisio-yellow transition hover:bg-corisio-yellow/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <BagIcon className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-corisio-yellow px-1 text-[10px] font-bold text-black">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {!signedIn && (
                <div className="hidden sm:block">
                  <AccountButton />
                </div>
              )}

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/30 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
              >
                {open ? (
                  <CloseIcon className="h-5 w-5" />
                ) : (
                  <MenuIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile / tablet search */}
          <div className="pb-4 lg:hidden">
            <SearchBar />
          </div>

          {/* Row 2 (desktop): browse / nav / flash sales */}
          <div className="hidden items-center gap-8 pb-4 lg:flex">
            {browseButton}
            <NavLinks pathname={pathname} signedIn={signedIn} />
            <div className="ml-auto">{flashSales}</div>
          </div>

          {/* Mobile / tablet menu */}
          {open && (
            <div
              id="mobile-menu"
              className="flex flex-col gap-4 border-t border-white/15 pb-5 pt-4 lg:hidden"
            >
              <div>{browseButton}</div>
              <NavLinks
                pathname={pathname}
                vertical
                onNavigate={closeMenu}
                signedIn={signedIn}
              />
              {signedIn && (
                <div className="flex items-center gap-5 border-t border-white/15 pt-4">
                  <HeaderIconLink
                    href="/wishlist"
                    label="Wishlist"
                    icon="heart"
                    onClick={closeMenu}
                  />
                  <HeaderIconLink
                    href="/loyalty"
                    label="Loyalty points"
                    icon="gem"
                    onClick={closeMenu}
                  />
                </div>
              )}
              <div className="flex items-center justify-between border-t border-white/15 pt-4">
                {flashSales}
                <AccountButton size="sm" onAction={closeMenu} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}