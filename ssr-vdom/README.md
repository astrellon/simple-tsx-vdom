# Simple TSX VDom Server Side Rendering
![NPM](https://badgen.net/npm/v/simple-tsx-vdom-ssr)![Badge for Gzip size](https://badgen.net/bundlephobia/minzip/simple-tsx-vdom-ssr)

A simple implementation of server-side rendering HTML for [simple-tsx-vdom](https://www.npmjs.com/package/simple-tsx-vdom).

*Note*: This is not intended for production nor as a proper replacement for more complete solutions like React or Preact.

## Install
To get from npm simply run.
```sh
npm install --save simple-tsx-vdom-ssr
```

You will also need [simple-tsx-vdom](https://www.npmjs.com/package/simple-tsx-vdom) installed as it is a peer dependency.

## Features
- Small file size about 1kb after compression.
- No other dependencies other than simple-tsx-vdom.
- Written in Typescript..
- Simple API, implements a simple in-memory DOM for simple-tsx-vdom that can then be turned into a string.

## Example

```typescript
import { vdom, render, VDom, FunctionalComponent } from "simple-tsx-vdom";
import { SSRDomDocument } from "../../src";

const ssrDomDocument = new SSRDomDocument();
const ssrVDom = new VDom(ssrDomDocument);
VDom.current = ssrVDom;

const Navbar: FunctionalComponent = () =>
    <nav>
        App Name
        <button onclick={() => console.log('About')}>About</button>
        <button onclick={() => console.log('Help')}>Help</button>
    </nav>;

const Footer: FunctionalComponent = () =>
    <footer>
        Alan Lawrey {new Date().getFullYear()}
    </footer>;

const App = <main>
    <Navbar />

    <h1>Title</h1>
    <p style={{'background-color': 'red'}}>Hello</p>
    <p style={{margin: '5px'}}>Whats up?</p>

    <Footer />
</main>

const parent = ssrDomDocument.createEmpty();

render(App, parent);

console.log(parent.toString());

// Console will output the HTML in a single line, formatted here for readability
// <main>
//     <nav>
//         App Name
//         <button>About</button>
//         <button>Help</button>
//     </nav>
//
//     <h1>Title</h1>
//     <p style="background-color:red;">Hello</p>
//     <p style="margin:5px;">Whats up?</p>
//
//     <footer>Alan Lawrey <!-- -->2021</footer>
// </main>
```

In the above example you can see that there is a `<!-- -->` in the `footer`. This is one of the parts that
makes this specifically for server side rendering and then hydration on the frontend. The comment tag allows for breaking up between sequential text nodes that would other wise appear as a single text node when the browser parses the HTML.

You can also see that there's no attempt to output event handlers for the buttons, which again should be handled by hydration on the frontend where all the elements should be used as sent from the server and event handlers attached.

## License
MIT

## Author
Alan Lawrey 2021