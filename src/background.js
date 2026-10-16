chrome.tabs.onCreated.addListener((tab) => {
  if (tab.incognito) {
    chrome.tabs.update(tab.id, { url: 'https://www.google.com' });
  }
});
