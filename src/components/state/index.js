export const actions = {
  SET_FOLDERS: 'setFolders',
  SET_BOOKMARKS: 'setBookmarks',
  SET_ACTIVE_FOLDER_ID: 'setActiveFolderId',
  SET_ACTIVE_FOLDER_PARENT_ID: 'setActiveFolderParentId',
  SET_SHOW_GO_UP: 'setShowGoUp',
  SET_SHOW_SEARCH: 'setShowSearch',
  SET_SEARCH_VALUE: 'searchValue',
  SET_SHOW_SETTINGS: 'showSettings',
};

export const initialState = {
  bookmarks: [],
  folders: [],
  activeFolder: 0,
  activeFolderParentId: '0',
  showGoUp: false,
  showSearch: false,
  searchValue: '',
  showSettings: false,
};

export const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_FOLDERS: {
      return {
        ...state,
        folders: action.folders,
      };
    }
    case actions.SET_BOOKMARKS: {
      return {
        ...state,
        bookmarks: action.bookmarks,
      };
    }
    case actions.SET_ACTIVE_FOLDER_ID: {
      return {
        ...state,
        activeFolder: action.id,
      };
    }
    case actions.SET_ACTIVE_FOLDER_PARENT_ID: {
      return {
        ...state,
        activeFolderParentId: action.id,
      };
    }
    case actions.SET_SHOW_GO_UP: {
      return {
        ...state,
        showGoUp: action.value,
      };
    }
    case actions.SET_SHOW_SEARCH: {
      return {
        ...state,
        showSearch: action.value,
      };
    }
    case actions.SET_SHOW_SETTINGS: {
      return {
        ...state,
        showSettings: action.value,
      };
    }
    case actions.SET_SEARCH_VALUE: {
      return {
        ...state,
        searchValue: action.value,
      };
    }
    default:
      throw Error('Unknown action: ' + action.type);
  }
};
