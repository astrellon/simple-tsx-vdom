import { vdom, render, RenderNode } from "../../src";

// Very basic state management
interface Store
{
    readonly counter: number;
}

let store: Store = { counter: 0 }

function changeCounter(diff: number)
{
    store = { ...store, counter: store.counter + diff };
    renderApp();
}

// App functional component
interface AppProps
{
    readonly store: Store;
}
const App: RenderNode = (props: AppProps) =>
    <main>
        <h1>Simple VDom Counter Example</h1>
        <div>Counter: {props.store.counter}</div>
        <button onclick={() => changeCounter(-1)}>Decrement</button>
        <button onclick={() => changeCounter(1)}>Increment</button>
    </main>

// Get the parent element to render the vdom into.
const rootElement = document.getElementById('root');

// Render the app on start
renderApp();

function renderApp()
{
    render(<App store={store} />, rootElement);
}