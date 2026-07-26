import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

// console.log(import.meta.env.VITE_AUTH0_DOMAIN);

// This provider must live inside BrowserRouter so it can navigate after Auth0 returns.
// eslint-disable-next-line react-refresh/only-export-components
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);