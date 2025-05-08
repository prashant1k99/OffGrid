import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundry";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  < ErrorBoundary fallback={< div > Oops! Something went wrong.</div >}>
    <App />
  </ErrorBoundary >
);
