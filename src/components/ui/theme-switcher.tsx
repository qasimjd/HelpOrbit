"use client"

import { useTheme as useNextTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function ThemeSwitcher() {
  const { theme, setTheme } = useNextTheme()

  // true = dark, false = light
  const isDark = theme === "dark"

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className="flex items-center gap-2">
      <Sun className="size-[18px]" />
      <Switch checked={isDark} onCheckedChange={handleToggle} />
      <Moon className="size-[18px]" />
    </div>
  )
}
