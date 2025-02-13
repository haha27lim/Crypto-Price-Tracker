"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Home, LineChart, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className={`border-r bg-background transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h2 className="text-lg font-semibold">CryptoTracker</h2>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="space-y-2 p-2">
          <Link href="/">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
            >
              <Home className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Dashboard</span>}
            </Button>
          </Link>
          <Link href="/analytics">
            <Button
              variant={isActive("/analytics") ? "default" : "ghost"}
              className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
            >
              <LineChart className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Analytics</span>}
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant={isActive("/settings") ? "default" : "ghost"}
              className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
            >
              <Settings className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Settings</span>}
            </Button>
          </Link>
        </div>
      </ScrollArea>
    </div>
  )
}

