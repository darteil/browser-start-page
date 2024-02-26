import { useEffect, useState } from 'preact/hooks';

const createBookmarksTree = (chromeBookmarksTree) => {
  if (!chromeBookmarksTree) return [];

  const bookmarks = [];

  for (let i = 0; i < chromeBookmarksTree.length; i++) {
    if (chromeBookmarksTree[i].url) {
      bookmarks.push({
        id: chromeBookmarksTree[i].id,
        parentId: chromeBookmarksTree[i].parentId,
        type: 'bookmark',
        title: chromeBookmarksTree[i].title,
        url: chromeBookmarksTree[i].url,
      });
    } else {
      bookmarks.push({
        id: chromeBookmarksTree[i].id,
        parentId: chromeBookmarksTree[i].parentId,
        type: 'folder',
        title: chromeBookmarksTree[i].title,
        bookmarks: createBookmarksTree(chromeBookmarksTree[i].children),
      });
    }
  }

  return bookmarks;
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
};

export { createBookmarksTree, useDebounce };
