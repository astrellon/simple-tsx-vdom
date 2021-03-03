import { vdom, render, FunctionalComponent } from "../../src";

// Very basic state management
interface Store
{
    readonly counter: number;
    readonly timeCounter: number;
}

let store: Store = { counter: 0, timeCounter: 0 }

function changeCounter(diff: number)
{
    store = { ...store, counter: store.counter + diff };
    renderApp();
}

function incTimeCounter()
{
    store = { ...store, timeCounter: store.timeCounter + 1 };
    renderApp();
}

// App functional component
interface AppProps
{
    readonly store: Store;
}
const App: FunctionalComponent = (props: AppProps) =>
    <main>
        <h1>Simple VDom Counter Example</h1>
        <div>Time Counter: {props.store.timeCounter}</div>
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

setInterval(incTimeCounter, 100);