import { html } from 'htm/preact';

const Folders = ({ folders, activeFolder, getBookmarks, setActiveFolder }) => html`
  <div class="folders">
    ${folders.map(
      (folder) =>
        html`<div
          key=${folder.id}
          class=${folder.id === activeFolder ? 'active' : ''}
          onClick=${() => {
            getBookmarks(folder.id, folder.parentId);
            setActiveFolder(folder.id);
          }}
        >
          <p>${folder.title}</p>
        </div>`,
    )}
  </div>
`;

export default Folders;
