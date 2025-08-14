import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CONFIG } from './config';


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider
     clientId={CONFIG.GOOGLE_CLIENT_ID}
    >
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
