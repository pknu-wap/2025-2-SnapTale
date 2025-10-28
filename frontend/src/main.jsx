import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./contexts/UserContext.jsx";
import { GameProvider } from "./contexts/GameContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </UserProvider>
  </StrictMode>
);