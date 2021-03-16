# Simple TSX VDom
![NPM](https://badgen.net/npm/v/simple-tsx-vdom)![Badge for Gzip size](https://badgen.net/bundlephobia/minzip/simple-tsx-vdom)

A simple implementation of a virtual DOM with TSX support.

Supports the expected regular document element types, SVG, functional components, class components, inline styles, extendable via subclassing and in a small size.

This is primarily intended for practice and learning. It uses a simple process for applying differences to the DOM but it aims for something that is easily readable and doesn't use any clever tricks.

*Note*: This is not intended for production nor as a proper replacement for more complete solutions like React or Preact.

## Install
To get from npm simply run.
```sh
npm install --save simple-tsx-vdom
```

Alternatively you can download the code and build it yourself with
```sh
npm run build
```
And in the `dist` folder will be the Javascript and Typescript typings file.

Also the whole thing is one Typescript file so it's pretty easy to manually add it to your own source code.

## Features
- Small file size about 2.5kb after compression.
- Simple API, controlled via a class that can be subclassed for fine grain control.
- No dependencies.
- Written in Typescript.
- Pure class components, can be changed to non pure with subclassing.
- Pure functional components.
- Diffing process to reduce the number of DOM manipulations.
- SVG support
- Inline styles
- Hydrating from server-side rendering with the use of [simple-tsx-vdom-hydration](https://www.npmjs.com/package/simple-tsx-vdom-hydration) and [simple-tsx-vdom-ssr](https://www.npmjs.com/package/simple-tsx-vdom-ssr) packages.

## Why?
I mostly wanted to understand the basics of how a virtual DOM TSX style framework operated so I created one myself. I also wanted it to be feature complete enough to create a simple website with it.

## Example
Below is a very simple example of rendering a state that contains two numbers. One controlled by the user the other by an interval.

```typescript
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
```

## License
MIT

## Author
Alan Lawrey 2021