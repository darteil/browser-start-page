/* global chrome */
import { render } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { html } from 'htm/preact/index.js';

import FontSettings from './FontSettings.js';
import Folders from './Folders.js';
import Bookmarks from './Bookmarks.js';
import ToggleTheme from './ToggleTheme.js';
import { createBookmarksTree, useDebounce } from './utils.js';
import './styles/reset.css';
import './styles/styles.css';
import './styles/themes.css';

/** @jsx h */

const App = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(0);
  const [showGoUp, setShowGoUp] = useState(false);
  const [currentParentId, setCurrentParentId] = useState('0');
  const [searchValue, setSearchValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const debouncedSearch = useDebounce(searchValue, 200);
  const getCurrentTheme = () => {
    if (chrome.extension.inIncognitoContext) return 'incognito';
    return localStorage.getItem('current_theme') || 'default';
  };

  const [theme, setTheme] = useState(getCurrentTheme());
  const [font, setFont] = useState(localStorage.getItem('current_font') || 'Consolas');
  const [fontSize, setFontSize] = useState(localStorage.getItem('current_font_size') || '16');

  useEffect(() => {
    chrome.bookmarks.getSubTree('1', (chromeBookmarks) => {
      const bookmarksTree = createBookmarksTree(chromeBookmarks);
      const tempFolders = [];

      let mainBarHasBookmarks = false;

      for (let i = 0; i < bookmarksTree[0].bookmarks.length; i++) {
        if (bookmarksTree[0].bookmarks[i].type === 'bookmark') {
          mainBarHasBookmarks = true;
        }
        if (bookmarksTree[0].bookmarks[i].type === 'folder') {
          tempFolders.push(bookmarksTree[0].bookmarks[i]);
        }
      }

      if (mainBarHasBookmarks) {
        tempFolders.unshift({
          id: bookmarksTree[0].id,
          parentId: bookmarksTree[0].parentId,
          type: 'bookmark bar',
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
    if (currentParentId === '1' || currentParentId === '0') {
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
        if (bookmarksTree[0].bookmarks[i].type === 'bookmark') {
          tempBookmarks.push(bookmarksTree[0].bookmarks[i]);
        } else {
          if (bookmarksTree[0].id !== '1') {
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
    if (!chrome.extension.inIncognitoContext) {
      localStorage.setItem('current_font', fontName);
    }
  };

  const setFontSizeEvent = (size) => {
    setFontSize(size);
    if (!chrome.extension.inIncognitoContext) {
      localStorage.setItem('current_font_size', size);
    }
  };

  const toggleTheme = (theme) => {
    setTheme(theme);
    if (!chrome.extension.inIncognitoContext) {
      localStorage.setItem('current_theme', theme);
    }
  };

  const searchSetFocus = useCallback((node) => {
    if (node) node.focus();
  });

  const toggleSearch = () => {
    if (!showSearch) {
      setSearchValue('');
      setShowSearch(true);
      setBookmarks([]);
    } else {
      setShowSearch(false);
      if (folders.length > 0) {
        getBookmarks(folders[0].id, folders[0].parentId);
        setActiveFolder(folders[0].id);
      }
    }
  };

  useEffect(() => {
    if (debouncedSearch && debouncedSearch.length >= 3) {
      chrome.bookmarks.search(searchValue, (result) => {
        const tempBookmarks = [];
        const bookmarksTree = createBookmarksTree(result);

        for (let i = 0; i < bookmarksTree.length; i++) {
          if (bookmarksTree[i].type === 'bookmark') {
            tempBookmarks.push(bookmarksTree[i]);
          }
        }
        setBookmarks(tempBookmarks);
      });
    } else {
      setBookmarks([]);
    }
  }, [debouncedSearch]);

  return html`
    <div class="container" data-theme=${theme} style="font-size: ${fontSize}px; font-family: ${font};">
      ${showSearch
        ? html`
            <input
              ref=${searchSetFocus}
              placeholder="Search"
              class="search"
              value=${searchValue}
              onInput=${(event) => setSearchValue(event.target.value)}
            />
          `
        : html`
            <${Folders}
              folders=${folders}
              activeFolder=${activeFolder}
              getBookmarks=${getBookmarks}
              setActiveFolder=${setActiveFolder}
            />
          `}
      <${Bookmarks} showGoUp=${showGoUp} goUp=${goUp} bookmarks=${bookmarks} getBookmarks=${getBookmarks} />
      <div class="tools">
        <button class="search-btn ${showSearch ? 'active' : ''}" onClick=${toggleSearch}>Search</button>
        <button class="settings-btn ${showSettings ? 'active' : ''}" onClick=${() => setShowSettings(!showSettings)}>
          Settings
        </button>
      </div>
      ${showSettings &&
      html`
        <div class="settings">
          <${ToggleTheme} currentTheme=${theme} setTheme=${toggleTheme} />
          <${FontSettings}
            currentFontSize=${fontSize}
            currentFont=${font}
            setFont=${setFontEvent}
            setSize=${setFontSizeEvent}
          />
        </div>
      `}
    </div>
  `;
};

render(html` <${App} /> `, document.getElementById('root'));
