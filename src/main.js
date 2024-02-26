import { render } from 'preact';
import { html } from 'htm/preact';
import App from './components/App.js';

import './styles/reset.css';
import './styles/themes.css';
import './styles/styles.css';

render(html` <${App} /> `, document.getElementById('root'));
