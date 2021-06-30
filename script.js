const { h, render } = preact;
const { useState, useEffect } = preactHooks;
const html = htm.bind(h);

/** @jsx h */

const FONT_SIZES = [
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "22",
  "24",
  "26",
  "28",
  "32",
];

const createBookmarksTree = (chromeBookmarksTree) => {
  if (!chromeBookmarksTree) return [];

  const bookmarks = [];

  for (let i = 0; i < chromeBookmarksTree.length; i++) {
    if (chromeBookmarksTree[i].url) {
      bookmarks.push({
        id: chromeBookmarksTree[i].id,
        parentId: chromeBookmarksTree[i].parentId,
        type: "bookmark",
        title: chromeBookmarksTree[i].title,
        url: chromeBookmarksTree[i].url,
      });
    } else {
      bookmarks.push({
        id: chromeBookmarksTree[i].id,
        parentId: chromeBookmarksTree[i].parentId,
        type: "folder",
        title: chromeBookmarksTree[i].title,
        bookmarks: createBookmarksTree(chromeBookmarksTree[i].children),
      });
    }
  }

  return bookmarks;
};

const FontSettings = (props) => {
  const [fontList, setFontList] = useState([]);
  const [show, setShow] = useState(false);

  useState(() => {
    chrome.fontSettings.getFontList((list) => {
      setFontList(list);
    });
  }, []);

  return html`
    <div class="font-settings">
      ${!show &&
      html`<button onClick=${() => setShow(true)}>Font settings</botton>`}
      ${show &&
      html`
        <select
          value=${props.currentFont}
          onChange=${(event) => props.setFont(event.target.value)}
        >
          ${fontList.map(
            (font) =>
              html`<option key=${font.fontId} value=${font.displayName}>
                ${font.displayName}
              </option>`
          )}
        </select>
        <select
          value=${props.currentFontSize}
          onChange=${(event) => props.setSize(event.target.value)}
        >
          ${FONT_SIZES.map(
            (fontSize) =>
              html`<option key=${fontSize} value=${fontSize}>
                ${fontSize}
              </option>`
          )}
        </select>
      `}
    </div>
  `;
};

const App = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(0);
  const [showGoUp, setShowGoUp] = useState(false);
  const [currentParentId, setCurrentParentId] = useState("0");

  const [isHome, setIsHome] = useState(
    JSON.parse(localStorage.getItem("home_theme")) || false
  );
  const [font, setFont] = useState(
    localStorage.getItem("current_font") || "Consolas"
  );
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("current_font_size") || "16"
  );

  useEffect(() => {
    chrome.bookmarks.getSubTree("1", (chromeBookmarks) => {
      const bookmarksTree = createBookmarksTree(chromeBookmarks);
      const tempFolders = [];

      let mainBarHasBookmarks = false;

      for (let i = 0; i < bookmarksTree[0].bookmarks.length; i++) {
        if (bookmarksTree[0].bookmarks[i].type === "bookmark") {
          mainBarHasBookmarks = true;
        }
        if (bookmarksTree[0].bookmarks[i].type === "folder") {
          tempFolders.push(bookmarksTree[0].bookmarks[i]);
        }
      }

      if (mainBarHasBookmarks) {
        tempFolders.unshift({
          id: bookmarksTree[0].id,
          type: "bookmark bar",
          title: bookmarksTree[0].title,
        });
      }

      setFolders(tempFolders);
    });
  }, []);

  useEffect(() => {
    if (folders.length > 0) {
      getBookmarks(folders[0].id, folders[0].parentId);
      setActiveFolder(folders[0].id);
    }
  }, [folders]);

  useEffect(() => {
    if (currentParentId === "1" || currentParentId === "0") {
      setShowGoUp(false);
    } else {
      setShowGoUp(true);
    }
  }, [currentParentId]);

  const getBookmarks = (id, parentId) => {
    chrome.bookmarks.getSubTree(id, (chromeBookmarks) => {
      const tempBookmarks = [];
      const bookmarksTree = createBookmarksTree(chromeBookmarks);

      for (let i = 0; i < bookmarksTree[0].bookmarks.length; i++) {
        if (bookmarksTree[0].bookmarks[i].type === "bookmark") {
          tempBookmarks.push(bookmarksTree[0].bookmarks[i]);
        } else {
          if (bookmarksTree[0].id !== "1") {
            tempBookmarks.push(bookmarksTree[0].bookmarks[i]);
          }
        }
      }
      setBookmarks(tempBookmarks);
      setCurrentParentId(parentId);
    });
  };

  const goUp = () => {
    chrome.bookmarks.getSubTree(currentParentId, (chromeBookmarks) => {
      getBookmarks(currentParentId, chromeBookmarks[0].parentId);
    });
  };

  const setFontEvent = (fontName) => {
    setFont(fontName);
    localStorage.setItem("current_font", fontName);
  };

  const setFontSizeEvent = (size) => {
    setFontSize(size);
    localStorage.setItem("current_font_size", size);
  };

  const toggleHomeTheme = () => {
    setIsHome(!isHome);
    localStorage.setItem("home_theme", !isHome);
  };

  return html`
    <div
      class="container ${isHome ? "home" : ""}"
      style="font-size: ${fontSize}px; font-family: ${font};"
    >
      <div class="folders">
        ${folders.map(
          (folder) =>
            html`<div
              key=${folder.id}
              class=${folder.id === activeFolder ? "active" : ""}
              onClick=${() => {
                getBookmarks(folder.id, folder.parentId);
                setActiveFolder(folder.id);
              }}
            >
              <p>${folder.title}</p>
            </div>`
        )}
      </div>
      <div class="bookmarks">
        <ul>
          ${showGoUp &&
          html`<li
            onClick=${() => {
              goUp();
            }}
          >
            <a>⮤ ...</a>
          </li>`}
          ${bookmarks.map((node) => {
            if (node.type === "bookmark") {
              return html`<li>
                <a href=${node.url}>${node.title}</a>
              </li>`;
            }
            return html`<li
              class="folder"
              onClick=${() => {
                getBookmarks(node.id, node.parentId);
              }}
            >
              <a>[${node.title}]</a>
            </li>`;
          })}
        </ul>
      </div>
      <${FontSettings}
        currentFontSize=${fontSize}
        currentFont=${font}
        setFont=${setFontEvent}
        setSize=${setFontSizeEvent}
      />
      <div class="home-switch" onClick=${() => toggleHomeTheme()}>🏡</div>
    </div>
  `;
};

render(html` <${App} /> `, document.getElementById("root"));
