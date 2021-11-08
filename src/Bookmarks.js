const { h } = preact;
const html = htm.bind(h);

const Bookmarks = ({ showGoUp, goUp, bookmarks, getBookmarks }) => html`
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
            <div>
              <img src=${`chrome://favicon/${node.url}`}/>
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
            <img src="./assets/images/folder.ico" />
            <a>${node.title}</a>
          </div>
        </li>`;
      })}
    </ul>
  </div>
`;

export default Bookmarks;
