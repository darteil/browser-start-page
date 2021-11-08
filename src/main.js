import FontSettings from "./FontSettings.js";
import Folders from "./Folders.js";
import Bookmarks from "./Bookmarks.js"
import { createBookmarksTree } from "./utils.js";

const { h, render } = preact;
const { useState, useEffect } = preactHooks;
const html = htm.bind(h);

/** @jsx h */

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
          parentId: bookmarksTree[0].parentId,
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
      <${Folders}
        folders=${folders}
        activeFolder=${activeFolder}
        getBookmarks=${getBookmarks}
        setActiveFolder=${setActiveFolder}
      />
      <${Bookmarks}
        showGoUp=${showGoUp}
        goUp=${goUp}
        bookmarks=${bookmarks}
        getBookmarks=${getBookmarks}
      />
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
