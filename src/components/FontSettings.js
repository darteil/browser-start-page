/* global chrome */
import { useState } from 'preact/hooks';
import { html } from 'htm/preact';

const FONT_SIZES = [
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '22',
  '24',
  '26',
  '28',
  '32',
];

const FontSettings = (props) => {
  const [fontList, setFontList] = useState([]);

  useState(() => {
    chrome.fontSettings.getFontList((list) => {
      setFontList(list);
    });
  }, []);

  return html`
    <div class="font-settings">
      <span>Font</span>
      <div>
        <select value=${props.currentFont} onChange=${(event) => props.setFont(event.target.value)}>
          ${fontList.map(
            (font) => html`<option key=${font.fontId} value=${font.displayName}>${font.displayName}</option>`,
          )}
        </select>
        <select value=${props.currentFontSize} onChange=${(event) => props.setSize(event.target.value)}>
          ${FONT_SIZES.map((fontSize) => html`<option key=${fontSize} value=${fontSize}>${fontSize}</option>`)}
        </select>
      </div>
    </div>
  `;
};

export default FontSettings;
