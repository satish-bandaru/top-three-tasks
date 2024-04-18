import React, { useEffect } from 'react';

function ContentScriptRuntime() {
  useEffect(() => {
    const sendMessageToRuntime = () => {
        console.log('DOM is loaded');
        const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        chrome.runtime.sendMessage({ theme: theme });
        console.log('Setting Theme', theme);
    };

    const createContextMenu = () => {
        console.log('DOM is loaded: Creating Context Menu');
        chrome.runtime.sendMessage({ createContextMenu: true });
    };

    sendMessageToRuntime();
    createContextMenu();
  }, []);

  return (
    <div>
    </div>
  );
}

export default ContentScriptRuntime;