import React from "react";
import { createRoot } from "react-dom/client";
import { App as AntApp, ConfigProvider, theme } from "antd";
import "antd/dist/reset.css";
import "@/index.css";
import App from "@/App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element with id 'root' was not found in the document.");
}

createRoot(container).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1f4fd1",
          borderRadius: 8,
          fontFamily:
            "'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
