# Simple VDom

A simple implementation of a virtual DOM.

Supports the expected regular document element types, SVG, functional components, class components and in a small size.

This is primarily intended for practice and learning. It uses a simple process for applying differences to the DOM but it aims for something that is easily readable and doesn't use any clever tricks.

*Note*: This is not intended for production nor as a proper replacement for more complete solutions like React or Preact.

## Install
To get from npm simply run.
```sh
npm install --save simple-vdom
```

Alternatively you can download the code and build it yourself with
```sh
npm run build
```
And in the `dist` folder will be the Javascript and Typescript typings file.

Also the whole thing is one Typescript file so it's pretty easy to manually add it to your own source code.

## Features
- Small file size (about 1.5kb after compression)
- Simple API.
- No dependencies
- Pure class components
- Functional components
- Diffing process to reduce the number of DOM manipulations.
- Small RAM footprint
- SVG support

## Why?
I mostly wanted to understand the basics of how a virtual DOM JSX style framework operated so I created one myself. I also wanted it to be feature complete enough to create a simple website with it.

## Example
Modifiers are functions that perform an action on the state. This means that the state does not need to know about modifiers at all.

In the example below it is shown that creating a function that returns the modifier with the values in the closure is useful.

```typescript
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
```

## License
MIT

## Author
Alan Lawrey 2021