/* global chrome */
import { html } from 'htm/preact';

const createFaviconURL = (url) => {
  const favUrl = new URL(chrome.runtime.getURL('/_favicon/'));
  favUrl.searchParams.set('pageUrl', url);
  favUrl.searchParams.set('size', '16');
  return favUrl.toString();
};

const Bookmarks = ({ showGoUp, goUp, bookmarks, getBookmarks }) => html`
  <div class="bookmarks">
    <ul>
      ${showGoUp &&
      html`<li
        onClick=${() => {
          goUp();
        }}
      >
        <a class="go-up">⮤ ...</a>
      </li>`}
      ${bookmarks.map((node) => {
        if (node.type === 'bookmark') {
          return html`<li>
            <div>
              <img src=${createFaviconURL(node.url)} />
              <a href=${node.url}>${node.title}</a>
            </div>
          </li>`;
        }
        return html`<li
          class="folder"
          onClick=${() => {
            getBookmarks(node.id, node.parentId);
          }}
        >
          <div>
            <img src="folder.ico" />
            <a>${node.title}</a>
          </div>
        </li>`;
      })}
    </ul>
  </div>
`;

export default Bookmarks;
