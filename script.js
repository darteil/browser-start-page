const { h, render } = preact;
const { useState, useEffect } = preactHooks;
const html = htm.bind(h);

/** @jsx h */

const App = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(0);

  useEffect(() => {
    chrome.bookmarks.getSubTree("1", (bookmarksTree) => {
      const tempFolders = [];

      for (let i = 0; i < bookmarksTree[0].children.length; i++) {
        tempFolders.push({
          id: bookmarksTree[0].children[i].id,
          title: bookmarksTree[0].children[i].title,
        });
      }

      setFolders(tempFolders);
    });
  }, []);

  useEffect(() => {
    if (folders.length > 0) getBookmarks(folders[0].id);
  }, [folders]);

  const getBookmarks = (id) => {
    chrome.bookmarks.getSubTree(id, (bookmarksTree) => {
      const tempBookmarks = [];

      for (let i = 0; i < bookmarksTree[0].children.length; i++) {
        tempBookmarks.push({
          title: bookmarksTree[0].children[i].title,
          url: bookmarksTree[0].children[i].url,
        });
      }
      setBookmarks(tempBookmarks);
      setActiveFolder(id);
    });
  };

  return html`
    <div class="container">
      <div class="folders">
        ${folders.map(
          (folder) =>
            html`<div
              class=${folder.id === activeFolder ? "active" : ""}
              onClick=${() => {
                getBookmarks(folder.id);
              }}
            >
              ${folder.title}
            </div>`
        )}
      </div>
      <div class="bookmarks">
        <ul>
          ${bookmarks.map(
            (bookmark) =>
              html`<li><a href=${bookmark.url}>${bookmark.title}</a></li>`
          )}
        </ul>
      </div>
    </div>
  `;
};

render(html` <${App} /> `, document.getElementById("root"));
