const { h } = preact;
const { useState } = preactHooks;
const html = htm.bind(h);

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
        <button onClick=${() => setShow(false)}>close</button>
      `}
    </div>
  `;
};

export default FontSettings;
