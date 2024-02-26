import { html } from 'htm/preact';

const themes = ['default', 'home', 'incognito'];

const ToggleTheme = ({ currentTheme, setTheme }) => html`
  <div class="toggle-theme">
    <span>Theme</span>
    <div>
      <select value=${currentTheme} onChange=${(event) => setTheme(event.target.value)}>
        ${themes.map((theme) => html`<option key=${theme} value=${theme}>${theme}</option>`)}
      </select>
    </div>
  </div>
`;

export default ToggleTheme;
