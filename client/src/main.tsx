import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/debugLogger"; // Initialize debug logging

createRoot(document.getElementById("root")!).render(<App />);
