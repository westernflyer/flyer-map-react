import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { APIProvider} from "@vis.gl/react-google-maps";
import App from "./App";
import { google_key } from "./google-api-key.js";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <APIProvider apiKey={google_key} onLoad={() =>console.log("Maps API has loaded.")}>
            <App />
        </APIProvider>
    </StrictMode>,
);
