import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(
    /* Remove the "StrictMode" tags for a production version. */
    <StrictMode>
        <App />
    </StrictMode>,
);