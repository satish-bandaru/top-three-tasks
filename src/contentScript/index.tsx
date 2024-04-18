import React from "react"
import { createRoot } from "react-dom/client"
import ReactDOM from 'react-dom';
import ContentScriptRuntime from './contentScript';


async function init() {
  const appContainer = document.createElement("div");
  document.body.appendChild(appContainer);

  if (!appContainer) {
    throw new Error("Cannot find appContainer");
  }

  const root = createRoot(appContainer);
  root.render(<ContentScriptRuntime  />)
}

init()