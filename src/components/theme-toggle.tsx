import { Theme, useTheme } from "@/components/theme-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-full text-muted-foreground border-0">
        <SelectValue placeholder="Change Theme" />
      </SelectTrigger>
      <SelectContent className="z-[99999]">
        <SelectItem value={Theme.LIGHT}>Light</SelectItem>
        <SelectItem value={Theme.DARK}>Dark</SelectItem>
        <SelectItem value={Theme.SYSTEM}>System</SelectItem>
      </SelectContent>
    </Select>
  )
}
