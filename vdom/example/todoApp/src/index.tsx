import './normalize.css';
import './styles.scss';

import { vdom, render, VDom } from "../../../src";
import { todoAppStore, State } from "./todoAppStore";
import { App } from "./components/app";
import { VDomDebug } from './vdomDebug';

const vdomDebug = new VDomDebug(document);
VDom.current = vdomDebug;

function renderApp(state: State)
{
    const rootElement = document.getElementById('root');
    render(<App state={state} />, rootElement);

    console.log('Stats', vdomDebug.stats);
    vdomDebug.resetStats();
}

// Render the app on start
renderApp(todoAppStore.getState());

// Re-render the app when the store changes
todoAppStore.subscribe((state) =>
{
    renderApp(state);
});
