/* global chrome */
import { useState, useEffect, useCallback, useReducer } from 'preact/hooks';
import { html } from 'htm/preact';

import { initialState, reducer, actions } from './state';

import FontSettings from './FontSettings.js';
import Folders from './Folders.js';
import Bookmarks from './Bookmarks.js';
import ToggleTheme from './ToggleTheme.js';
import { createBookmarksTree, useDebounce } from './utils.js';

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const debouncedSearch = useDebounce(state.searchValue, 200);
  const getCurrentTheme = () => {
    if (chrome.extension.inIncognitoContext) return 'incognito';
    return localStorage.getItem('current_theme') || 'default';
  };

  const [theme, setTheme] = useState(getCurrentTheme());
  const [font, setFont] = useState(localStorage.getItem('current_font') || 'Consolas');
  const [fontSize, setFontSize] = useState(localStorage.getItem('current_font_size') || '16');

  const getFolders = () => {
    chrome.bookmarks.getSubTree('1', (chromeBookmarks) => {
      const bookmarksTree = createBookmarksTree(chromeBookmarks);
      const folders = [];

      let mainBarHasBookmarks = false;

      for (let i = 0; i < bookmarksTree[0].bookmarks.length; i++) {
        if (bookmarksTree[0].bookmarks[i].type === 'bookmark') {
          mainBarHasBookmarks = true;
        }
        if (bookmarksTree[0].bookmarks[i].type === 'folder') {
          folders.push(bookmarksTree[0].bookmarks[i]);
        }
      }

      if (mainBarHasBookmarks) {
        folders.unshift({
          id: bookmarksTree[0].id,
          parentId: bookmarksTree[0].parentId,
          type: 'bookmark bar',
          title: bookmarksTree[0].title,
        });
      }

      dispatch({
        type: actions.SET_FOLDERS,
        folders,
      });
    });
  };

  const getBookmarks = (id, parentId) => {
    chrome.bookmarks.getSubTree(id, (chromeBookmarks) => {
      const bookmarks = [];
      const bookmarksTree = createBookmarksTree(chromeBookmarks);

      for (let i = 0; i < bookmarksTree[0].bookmarks.length; i++) {
        if (bookmarksTree[0].bookmarks[i].type === 'bookmark') {
          bookmarks.push(bookmarksTree[0].bookmarks[i]);
        } else {
          if (bookmarksTree[0].id !== '1') {
            bookmarks.push(bookmarksTree[0].bookmarks[i]);
          }
        }
      }
      dispatch({
        type: actions.SET_ACTIVE_FOLDER_PARENT_ID,
        id: parentId,
      });
      dispatch({
        type: actions.SET_BOOKMARKS,
        bookmarks,
      });
    });
  };

  const goUp = () => {
    chrome.bookmarks.getSubTree(state.activeFolderParentId, (chromeBookmarks) => {
      getBookmarks(state.activeFolderParentId, chromeBookmarks[0].parentId);
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

  const setActiveFolder = (value) => {
    dispatch({
      type: actions.SET_ACTIVE_FOLDER_ID,
      id: value,
    });
  };

  const searchSetFocus = useCallback((node) => {
    if (node) node.focus();
  });

  const toggleSearch = () => {
    if (!state.showSearch) {
      dispatch({
        type: actions.SET_SEARCH_VALUE,
        value: '',
      });
      dispatch({
        type: actions.SET_SHOW_SEARCH,
        value: true,
      });
      dispatch({
        type: actions.SET_BOOKMARKS,
        bookmarks: [],
      });
      dispatch({
        type: actions.SET_SHOW_GO_UP,
        value: false,
      });
    } else {
      dispatch({
        type: actions.SET_SHOW_SEARCH,
        value: false,
      });
      if (state.folders.length > 0) {
        getBookmarks(state.folders[0].id, state.folders[0].parentId);
        dispatch({
          type: actions.SET_ACTIVE_FOLDER_ID,
          id: state.folders[0].id,
        });
      }
    }
  };

  useEffect(() => {
    getFolders();
  }, []);

  useEffect(() => {
    if (debouncedSearch && debouncedSearch.length >= 3) {
      chrome.bookmarks.search(state.searchValue, (result) => {
        const bookmarks = [];
        const bookmarksTree = createBookmarksTree(result);

        for (let i = 0; i < bookmarksTree.length; i++) {
          if (bookmarksTree[i].type === 'bookmark') {
            bookmarks.push(bookmarksTree[i]);
          }
        }
        dispatch({
          type: actions.SET_BOOKMARKS,
          bookmarks,
        });
      });
    } else {
      dispatch({
        type: actions.SET_BOOKMARKS,
        bookmarks: [],
      });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (state.activeFolderParentId === '1' || state.activeFolderParentId === '0') {
      dispatch({
        type: actions.SET_SHOW_GO_UP,
        value: false,
      });
    } else {
      dispatch({
        type: actions.SET_SHOW_GO_UP,
        value: true,
      });
    }
  }, [state.activeFolderParentId]);

  useEffect(() => {
    if (state.folders.length > 0) {
      getBookmarks(state.folders[0].id, state.folders[0].parentId);
      dispatch({
        type: actions.SET_ACTIVE_FOLDER_ID,
        id: state.folders[0].id,
      });
    }
  }, [state.folders]);

  return html`
    <div class="container" data-theme=${theme} style="font-size: ${fontSize}px; font-family: ${font};">
      ${state.showSearch
        ? html`
            <input
              ref=${searchSetFocus}
              placeholder="Search"
              class="search"
              value=${state.searchValue}
              onInput=${(event) =>
                dispatch({
                  type: actions.SET_SEARCH_VALUE,
                  value: event.target.value,
                })}
            />
          `
        : html`
            <${Folders}
              setActiveFolder=${setActiveFolder}
              folders=${state.folders}
              activeFolder=${state.activeFolder}
              getBookmarks=${getBookmarks}
            />
          `}
      <${Bookmarks} showGoUp=${state.showGoUp} goUp=${goUp} bookmarks=${state.bookmarks} getBookmarks=${getBookmarks} />
      <div class="tools">
        <button class="search-btn ${state.showSearch ? 'active' : ''}" onClick=${toggleSearch}>Search</button>
        <button
          class="settings-btn ${state.showSettings ? 'active' : ''}"
          onClick=${() => dispatch({ type: actions.SET_SHOW_SETTINGS, value: !state.showSettings })}
        >
          Settings
        </button>
      </div>
      ${state.showSettings &&
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

export default App;
