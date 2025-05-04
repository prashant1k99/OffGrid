import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/theme-toggle";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <main className="container">
        <p>Hello world</p>
        <br />
        <ModeToggle />
      </main>
    </ThemeProvider>
  );
}

export default App;
