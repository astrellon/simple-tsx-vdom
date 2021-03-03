import './normalize.css';
import './styles.scss';

import { vdom, render } from "../../../src";
import { App } from "./components/app";

// Get the parent element to render the vdom into.
const rootElement = document.getElementById('root');

// Render the app on start
render(<App />, rootElement);