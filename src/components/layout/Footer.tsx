import Link from "next/link";
import { X, Share2 } from "lucide-react";

const ABOUT_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "Meet The Team" },
  { href: "/contact", label: "Contact Us" },
];

const SUPPORT_LINKS = [
  { href: "/contact", label: "Contact Us" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/faq", label: "FAQ" },
];

const SOCIAL = [
  { href: "https://x.com", icon: X, label: "X" },
  { href: "https://linkedin.com", icon: Share2, label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Links grid */}
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-20 mb-10">
          <div>
            <p className="text-sm font-bold text-gray-900 mb-4">About</p>
            <ul className="space-y-2.5">
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900 mb-4">Support</p>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social icons */}
          <div className="sm:ml-auto">
            <p className="text-sm font-bold text-gray-900 mb-4">Social Media</p>
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ href, icon: Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} TheElevatorShop. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
