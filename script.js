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
    chrome.bookmarks.getSubTree("1", (bookmarksTree) => {
      const tempFolders = [];

      for (let i = 0; i < bookmarksTree[0].children.length; i++) {
        if (bookmarksTree[0].children[i].children) {
          tempFolders.push({
            id: bookmarksTree[0].children[i].id,
            title: bookmarksTree[0].children[i].title,
          });
        }
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
                getBookmarks(folder.id);
              }}
            >
              <p>${folder.title}</p>
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
