import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// PWA service worker registration
import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() {
    console.log("🔄 New content available, refresh the page.");
  },
  onOfflineReady() {
    console.log("✅ App ready to work offline.");
  },
});

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
