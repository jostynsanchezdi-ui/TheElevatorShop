"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Menu, User, MapPin, CreditCard, Package, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";
import { useAuthModal } from "@/lib/auth-modal-store";
import { useContactModal } from "@/lib/contact-modal-store";
import { useAuth } from "@/lib/auth-store";
import AccountModal from "@/components/auth/AccountModal";
import AddressesModal from "@/components/auth/AddressesModal";
import PaymentMethodsModal from "@/components/auth/PaymentMethodsModal";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  { title: "Shop", url: "/products" },
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
  const [paymentOpen, setPaymentOpen] = React.useState(false);
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
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6 relative">

        {/* Logo */}
        <Link href="/" className="hidden lg:flex items-center shrink-0">
          <Image src="/logo.png" alt="The Elevator Shop" width={180} height={54} priority unoptimized />
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
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
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
                          { icon: <MapPin className="w-4 h-4" />,     label: "Addresses",        onClick: () => { setAccountOpen(false); setAddressesOpen(true); } },
                          { icon: <CreditCard className="w-4 h-4" />, label: "Payment Methods",  onClick: () => { setAccountOpen(false); setPaymentOpen(true); } },
                          { icon: <Package className="w-4 h-4" />,    label: "Purchase History", onClick: () => { setAccountOpen(false); setHistoryOpen(true); } },
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
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-3 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
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
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile logo */}
        <Link href="/" className="flex lg:hidden items-center">
          <Image src="/logo.png" alt="The Elevator Shop" width={130} height={39} priority unoptimized />
        </Link>

        {/* Mobile right actions */}
        <div className="flex items-center gap-2 lg:hidden ml-auto">
          <Button variant="ghost" size="icon" asChild className="relative text-[#2C3A48] hover:text-[#E87B3A]" aria-label="Cart">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E87B3A] text-[10px] font-bold text-white">0</span>
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="text-[#2C3A48] hover:text-[#E87B3A]">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {menu.map((item) =>
                  item.items ? (
                    <Accordion key={item.title} type="single" collapsible>
                      <AccordionItem value={item.title} className="border-none">
                        <AccordionTrigger className="py-2 text-sm font-medium text-[#2C3A48] hover:text-[#E87B3A] hover:no-underline">
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="pb-1">
                          <ul className="flex flex-col gap-1 pl-2">
                            {item.items.map((sub) => (
                              <li key={sub.title}>
                                <Link href={sub.url} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-[#2C3A48] hover:bg-orange-50 hover:text-[#E87B3A] transition-colors">
                                  <span className="text-[#E87B3A]">{sub.icon}</span>
                                  {sub.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <Link key={item.title} href={item.url} className="rounded-md px-2 py-2 text-sm font-medium text-[#2C3A48] hover:bg-orange-50 hover:text-[#E87B3A] transition-colors">
                      {item.title}
                    </Link>
                  )
                )}
              </nav>
              <div className="mt-6 flex flex-col gap-2 border-t border-[#e5e7eb] pt-6">
                <Button variant="outline" onClick={() => openAuth("login")} className="w-full border-[#2C3A48] text-[#2C3A48] hover:bg-[#2C3A48] hover:text-white">
                  {auth.login.title}
                </Button>
                <Button onClick={() => openAuth("register")} className="w-full bg-[#E87B3A] text-white hover:bg-[#d06b2a]">
                  {auth.signup.title}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    <AccountModal open={accountInfoOpen} onClose={() => setAccountInfoOpen(false)} />
    <AddressesModal open={addressesOpen} onClose={() => setAddressesOpen(false)} />
    <PaymentMethodsModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    <PurchaseHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
