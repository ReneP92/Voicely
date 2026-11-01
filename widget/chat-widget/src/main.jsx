import React from "react";
import ReactDOM from "react-dom/client";
import ChatWidget from "./ChatWidget";
import "./index.css"; // Tailwind styles

// Embed mode
window.MyChatWidget = {
  init: (config) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    ReactDOM.createRoot(container).render(<ChatWidget {...config} />);
  },
};

// Dev mode: mount widget directly on the page
if (import.meta.env.MODE === "development") {
  const devRoot = document.getElementById("root");
  if (devRoot) {
    ReactDOM.createRoot(devRoot).render(
      <React.StrictMode>
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <ChatWidget />
        </div>
      </React.StrictMode>
    );
  }
}