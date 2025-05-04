import { useTheme } from "@/components/theme-provider"
import { Button } from "./ui/button"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    if (theme == "light") {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  return (
    <Button onClick={() => toggleTheme()}>Toggle Theme</Button>
  )
}
