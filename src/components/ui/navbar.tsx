"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Menu, User, MapPin, Package, HelpCircle, LogOut, ChevronRight, Info, Mail, LayoutGrid } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";
import { useAuthModal } from "@/lib/auth-modal-store";
import { useContactModal } from "@/lib/contact-modal-store";
import { useAuth } from "@/lib/auth-store";
import AccountModal from "@/components/auth/AccountModal";
import AddressesModal from "@/components/auth/AddressesModal";
import PurchaseHistoryModal from "@/components/auth/PurchaseHistoryModal";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useCategoriesModal } from "@/lib/categories-modal-store";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface NavbarProps {
  menu?: MenuItem[];
  auth?: {
    login: { title: string; url: string };
    signup: { title: string; url: string };
  };
}

const defaultMenu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "About", url: "/about" },
];

export default function Navbar({
  menu = defaultMenu,
  auth = {
    login:  { title: "Sign In",     url: "/auth/login"    },
    signup: { title: "Get Started", url: "/auth/register" },
  },
}: NavbarProps) {
  const wishlistCount = useWishlist((s) => s.items.length);
  const cartCount = useCart((s) => s.items.length);
  const openAuth = useAuthModal((s) => s.open);
  const openContact = useContactModal((s) => s.show);
  const { user, signOut, signedOut } = useAuth();
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [accountInfoOpen, setAccountInfoOpen] = React.useState(false);
  const [addressesOpen, setAddressesOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setHistoryOpen(true);
    window.addEventListener("open-purchase-history", handler);
    return () => window.removeEventListener("open-purchase-history", handler);
  }, []);

  const navMenu = (
    <NavigationMenu>
      <NavigationMenuList>
        {menu.map((item) =>
          item.items ? (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuTrigger className="text-[#2C3A48] hover:text-[#E87B3A] bg-transparent hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-[#E87B3A] focus:bg-transparent">
                {item.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[480px] gap-2 p-4 md:grid-cols-2">
                  {item.items.map((sub) => (
                    <li key={sub.title}>
                      <NavigationMenuLink asChild>
                        <Link href={sub.url} className={cn("flex select-none gap-3 rounded-md p-3 leading-none no-underline outline-none transition-colors", "hover:bg-orange-50 hover:text-[#E87B3A] focus:bg-orange-50")}>
                          <div className="mt-0.5 text-[#E87B3A]">{sub.icon}</div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium leading-none text-[#2C3A48]">{sub.title}</div>
                            {sub.description && <p className="line-clamp-2 text-xs leading-snug text-[#6b7280]">{sub.description}</p>}
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuLink asChild>
                <Link href={item.url} className="inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-[#2C3A48] transition-colors hover:text-[#E87B3A] bg-transparent hover:bg-transparent focus:outline-none">
                  {item.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        )}
        <NavigationMenuItem>
          <button
            onClick={openContact}
            className="inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-[#2C3A48] transition-colors hover:text-[#E87B3A] bg-transparent hover:bg-transparent focus:outline-none"
          >
            Contact
          </button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );

  return (
    <>
    <AnimatePresence>
      {signedOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="flex flex-col items-center gap-4 bg-white rounded-3xl shadow-2xl px-12 py-10"
          >
            <motion.svg width="64" height="64" viewBox="0 0 56 56" fill="none" className="drop-shadow-lg">
              <motion.circle cx="28" cy="28" r="24" stroke="white" strokeWidth="2.5" fill="rgba(44,58,72,0.9)"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }} strokeLinecap="round" />
              <motion.path d="M19 28L26 35L37 21" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.3 }} />
            </motion.svg>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.2 }}
              className="text-center"
            >
              <p className="text-lg font-extrabold text-[#2C3A48]">Session Closed</p>
              <p className="text-sm text-gray-400 mt-1">You have been signed out successfully.</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    {/* Mobile top bar: logo left + Profile right */}
    <div className="lg:hidden sticky top-0 z-[60] w-full bg-white border-b border-[#e5e7eb]">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/" aria-label="TheElevatorShop home">
          <Image src="/logo.png" alt="The Elevator Shop" width={280} height={87} priority quality={100} sizes="140px" style={{ width: 140, height: "auto" }} />
        </Link>
        <button
          onClick={() => { if (user) { setAccountInfoOpen(true); } else { openAuth("login"); } }}
          aria-label={user ? "Account" : "Sign in"}
          className="flex items-center justify-center w-9 h-9 rounded-full text-[#2C3A48] active:bg-orange-50 transition-colors"
        >
          {user ? (
            <div className="w-8 h-8 rounded-full bg-[#E87B3A] flex items-center justify-center text-white text-sm font-bold">
              {(user.user_metadata?.full_name as string | undefined)?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
            </div>
          ) : (
            <User className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>

    <header className="hidden lg:block sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6 relative">

        {/* Logo */}
        <Link href="/" className="hidden lg:flex items-center shrink-0">
          <Image src="/logo.png" alt="The Elevator Shop" width={360} height={112} priority quality={100} sizes="180px" style={{ width: 180, height: "auto" }} />
        </Link>

        {/* Desktop — nav truly centered in full header */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
          {navMenu}
        </div>

        {/* Desktop right actions */}
        <div className="hidden lg:flex lg:items-center lg:gap-1 ml-auto">
          {/* Cart */}
          <div className="relative group">
            <Button variant="ghost" size="icon" asChild className="relative text-[#2C3A48] hover:text-[#E87B3A] hover:bg-orange-50" aria-label="Cart">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E87B3A] text-[10px] font-bold text-white">{cartCount}</span>
                )}
              </Link>
            </Button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#2C3A48] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Cart
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#2C3A48]" />
            </div>
          </div>

          {/* Wishlist */}
          <div className="relative group">
            <Button variant="ghost" size="icon" asChild className="relative text-[#2C3A48] hover:text-[#E87B3A] hover:bg-orange-50" aria-label="Wishlist">
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E87B3A] text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </Button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#2C3A48] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Wishlist
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#2C3A48]" />
            </div>
          </div>

          {/* Account */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                aria-label="Account menu"
                className="w-8 h-8 rounded-full bg-[#E87B3A] flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87B3A]"
              >
                {(user.user_metadata?.full_name as string | undefined)?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      style={{ transformOrigin: "top right" }}
                      className="absolute right-0 top-full mt-2 w-64 z-50"
                    >
                      {/* Caret pointing up to icon */}
                      <div className="absolute -top-2 right-2.5 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45 rounded-tl-sm shadow-[-2px_-2px_4px_rgba(0,0,0,0.04)]" />
                      <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
                      {/* Account Information */}
                      <button
                        onClick={() => { setAccountOpen(false); setAccountInfoOpen(true); }}
                        className="w-full px-4 pt-4 pb-3 text-left hover:bg-orange-50 transition-colors group"
                      >
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 group-hover:text-[#E87B3A] transition-colors">Account Information</p>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E87B3A] flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {(user.user_metadata?.full_name as string | undefined)?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#2C3A48] truncate group-hover:text-[#E87B3A] transition-colors">
                                {(user.user_metadata?.full_name as string | undefined) ?? "My Account"}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#E87B3A] transition-colors shrink-0" />
                        </div>
                      </button>

                      <div className="h-px bg-gray-100 mx-4" />

                      {/* Menu items */}
                      <div className="py-2">
                        {[
                          { icon: <MapPin className="w-4 h-4" />,  label: "Addresses",        onClick: () => { setAccountOpen(false); setAddressesOpen(true); } },
                          { icon: <Package className="w-4 h-4" />, label: "Purchase History", onClick: () => { setAccountOpen(false); setHistoryOpen(true); } },
                        ].map(({ icon, label, onClick }) => (
                          <button key={label} onClick={onClick}
                            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-[#2C3A48] hover:bg-orange-50 hover:text-[#E87B3A] transition-colors group"
                          >
                            <span className="flex items-center gap-3">
                              <span className="text-gray-400 group-hover:text-[#E87B3A] transition-colors">{icon}</span>
                              {label}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#E87B3A] transition-colors" />
                          </button>
                        ))}

                        <button
                          onClick={() => { setAccountOpen(false); openContact(); }}
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-[#2C3A48] hover:bg-orange-50 hover:text-[#E87B3A] transition-colors group"
                        >
                          <span className="flex items-center gap-3">
                            <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-[#E87B3A] transition-colors" />
                            Get Help
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#E87B3A] transition-colors" />
                        </button>
                      </div>

                      <div className="h-px bg-gray-100 mx-4" />

                      {/* Sign out */}
                      <div className="py-2">
                        <button
                          onClick={() => { signOut(); setAccountOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAccountOpen((v) => !v)}
                aria-label="Account"
                className="text-[#2C3A48] hover:text-[#E87B3A] hover:bg-orange-50"
              >
                <User className="h-5 w-5" />
              </Button>
              <AnimatePresence>
                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      style={{ transformOrigin: "top right" }}
                      className="absolute right-0 top-full mt-2 w-52 z-50"
                    >
                      {/* Caret pointing up to icon */}
                      <div className="absolute -top-2 right-2.5 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45 rounded-tl-sm shadow-[-2px_-2px_4px_rgba(0,0,0,0.04)]" />
                      <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-4 pt-4 pb-2">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">My Account</p>
                          <button
                            onClick={() => { setAccountOpen(false); openAuth("login"); }}
                            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#2C3A48] hover:bg-gray-50 transition-colors mb-2"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => { setAccountOpen(false); openAuth("register"); }}
                            className="w-full py-2.5 rounded-xl bg-[#E87B3A] text-white text-sm font-bold hover:bg-[#d06b2a] transition-colors"
                          >
                            Sign Up
                          </button>
                        </div>
                        <div className="px-4 py-3 border-t border-gray-100">
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            Sign in to save addresses, view orders, and manage your wishlist.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </header>

    {/* Mobile bottom nav (Instagram-style fixed footer) */}
    <MobileBottomNav
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      user={user}
      onOpenAuth={openAuth}
      onOpenContact={openContact}
      onOpenAccountInfo={() => setAccountInfoOpen(true)}
      onOpenAddresses={() => setAddressesOpen(true)}
      onOpenHistory={() => setHistoryOpen(true)}
      onSignOut={signOut}
      authLabels={auth}
    />
    <AccountModal open={accountInfoOpen} onClose={() => setAccountInfoOpen(false)} />
    <AddressesModal open={addressesOpen} onClose={() => setAddressesOpen(false)} />
    <PurchaseHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Mobile bottom navigation (Instagram-style fixed footer)
// ─────────────────────────────────────────────────────────────────

interface MobileBottomNavProps {
  cartCount: number;
  wishlistCount: number;
  user: SupabaseUser | null;
  onOpenAuth: (mode: "login" | "register") => void;
  onOpenContact: () => void;
  onOpenAccountInfo: () => void;
  onOpenAddresses: () => void;
  onOpenHistory: () => void;
  onSignOut: () => void;
  authLabels: { login: { title: string; url: string }; signup: { title: string; url: string } };
}

function MobileBottomNav({
  cartCount,
  wishlistCount,
  user,
  onOpenAuth,
  onOpenContact,
  onOpenAccountInfo,
  onOpenAddresses,
  onOpenHistory,
  onSignOut,
  authLabels,
}: MobileBottomNavProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const categoriesOpen = useCategoriesModal((s) => s.open);
  const toggleCategories = useCategoriesModal((s) => s.toggle);

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-[60] bg-white border-t border-[#e5e7eb] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-4 h-[56px]">
          {/* Categories */}
          <motion.button
            onClick={toggleCategories}
            whileTap={{ scale: 0.88 }}
            aria-label="Categories"
            aria-pressed={categoriesOpen}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${categoriesOpen ? "text-[#E87B3A] bg-orange-50" : "text-[#2C3A48] active:bg-orange-50"}`}
          >
            <LayoutGrid className="w-[18px] h-[18px]" />
            <span className="text-[9px] font-medium leading-none">Categories</span>
          </motion.button>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="flex flex-col items-center justify-center gap-0.5 text-[#2C3A48] active:bg-orange-50 transition-colors relative"
          >
            <div className="relative">
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#E87B3A] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium leading-none">Cart</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="flex flex-col items-center justify-center gap-0.5 text-[#2C3A48] active:bg-orange-50 transition-colors relative"
          >
            <div className="relative">
              <Heart className="w-[18px] h-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#E87B3A] text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium leading-none">Wishlist</span>
          </Link>

          {/* More (hamburger) */}
          <motion.button
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={{ scale: 0.88 }}
            aria-label="More menu"
            aria-pressed={menuOpen}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${menuOpen ? "text-[#E87B3A] bg-orange-50" : "text-[#2C3A48] active:bg-orange-50"}`}
          >
            <Menu className="w-[18px] h-[18px]" />
            <span className="text-[9px] font-medium leading-none">More</span>
          </motion.button>
        </div>
      </nav>

      {/* More menu sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" hideClose className="w-56 overflow-y-auto bg-white !top-14 !bottom-[56px] !h-auto pt-6">
          <nav className="flex flex-col gap-1">
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#2C3A48] hover:bg-orange-50 hover:text-[#E87B3A] transition-colors"
            >
              <Info className="w-4 h-4 text-gray-400" />
              About
            </Link>
            <button
              onClick={() => { setMenuOpen(false); onOpenContact(); }}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#2C3A48] hover:bg-orange-50 hover:text-[#E87B3A] transition-colors text-left"
            >
              <Mail className="w-4 h-4 text-gray-400" />
              Contact
            </button>
          </nav>

          {user ? (
            <div className="mt-6 border-t border-[#e5e7eb] pt-4 flex flex-col gap-1">
              <button
                onClick={() => { setMenuOpen(false); onOpenAddresses(); }}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#2C3A48] hover:bg-orange-50 hover:text-[#E87B3A] transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                Addresses
              </button>
              <button
                onClick={() => { setMenuOpen(false); onOpenHistory(); }}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#2C3A48] hover:bg-orange-50 hover:text-[#E87B3A] transition-colors text-left"
              >
                <Package className="w-4 h-4 text-gray-400" />
                Purchase History
              </button>
              <button
                onClick={() => { setMenuOpen(false); onOpenContact(); }}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#2C3A48] hover:bg-orange-50 hover:text-[#E87B3A] transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4 text-gray-400" />
                Get Help
              </button>
              <button
                onClick={() => { setMenuOpen(false); onSignOut(); }}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mt-6 border-t border-[#e5e7eb] pt-6 flex flex-col gap-2">
              <Button variant="outline" onClick={() => { setMenuOpen(false); onOpenAuth("login"); }} className="w-full border-[#2C3A48] text-[#2C3A48] hover:bg-[#2C3A48] hover:text-white">
                {authLabels.login.title}
              </Button>
              <Button onClick={() => { setMenuOpen(false); onOpenAuth("register"); }} className="w-full bg-[#E87B3A] text-white hover:bg-[#d06b2a]">
                {authLabels.signup.title}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
