chrome.runtime.onMessage.addListener((message: { theme: string }, sender, sendResponse) => {
    if (message.theme) {
      // Store the theme preference in local storage
      localStorage.setItem('theme', message.theme);
    }
  });
  