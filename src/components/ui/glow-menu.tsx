"use client"

import * as React from "react"
import { motion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface MenuItem {
  icon: LucideIcon | React.FC
  label: string
  href: string
  gradient: string
  iconColor: string
  badge?: number
}

interface MenuBarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: MenuItem[]
  activeItem?: string
  onItemClick?: (label: string) => void
}

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: "easeInOut" },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const sharedTransition = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

const ORANGE = "#E87B3A"

export const MenuBar = React.forwardRef<HTMLDivElement, MenuBarProps>(
  ({ className, items, activeItem, onItemClick }, ref) => {
    return (
      <motion.nav
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          "p-1.5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden bg-white",
          className,
        )}
        initial="initial"
        whileHover="hover"
      >
        <ul className="flex items-center gap-1 relative z-10">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = item.label === activeItem

            return (
              <motion.li key={item.label} className="relative">
                <button
                  onClick={() => onItemClick?.(item.label)}
                  className="block w-full"
                >
                  <motion.div
                    className="block rounded-xl overflow-visible group relative"
                    style={{ perspective: "600px" }}
                    whileHover="hover"
                    initial="initial"
                  >
                    {/* orange glow blob */}
                    <motion.div
                      className="absolute inset-0 z-0 pointer-events-none"
                      variants={glowVariants}
                      animate={isActive ? "hover" : "initial"}
                      style={{ background: item.gradient, borderRadius: "16px" }}
                    />

                    {/* front face */}
                    <motion.div
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 relative z-10 rounded-xl transition-colors",
                        isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900",
                      )}
                      variants={itemVariants}
                      transition={sharedTransition}
                      style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                    >
                      <span className="relative">
                        <Icon className="h-4 w-4" />
                        {item.badge != null && item.badge > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.div>

                    {/* back face */}
                    <motion.div
                      className="flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 rounded-xl"
                      variants={backVariants}
                      transition={sharedTransition}
                      style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
                    >
                      <span className="relative" style={{ color: ORANGE }}>
                        <Icon className="h-4 w-4" />
                        {item.badge != null && item.badge > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-medium" style={{ color: ORANGE }}>{item.label}</span>
                    </motion.div>
                  </motion.div>
                </button>
              </motion.li>
            )
          })}
        </ul>
      </motion.nav>
    )
  },
)

MenuBar.displayName = "MenuBar"
