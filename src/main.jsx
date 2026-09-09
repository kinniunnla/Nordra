import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import NordraOS from "./NordraOS.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NordraOS />
    <Analytics />
  </React.StrictMode>
);
