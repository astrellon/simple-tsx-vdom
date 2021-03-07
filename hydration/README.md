# Simple TSX VDom Hydration
![NPM](https://badgen.net/npm/v/simple-tsx-vdom-hydration)![Badge for Gzip size](https://badgen.net/bundlephobia/minzip/simple-tsx-vdom-hydration)

A simple implementation of hydrating server-side rendered HTML for [simple-tsx-vdom](https://www.npmjs.com/package/simple-tsx-vdom).

*Note*: This is not intended for production nor as a proper replacement for more complete solutions like React or Preact.

## Install
To get from npm simply run.
```sh
npm install --save simple-tsx-vdom-hydration
```

You will also need [simple-tsx-vdom](https://www.npmjs.com/package/simple-tsx-vdom) installed as it is a peer dependency.

## Features
- Small file size less than 1kb after compression.
- No other dependencies other than simple-tsx-vdom.
- Written in Typescript..
- Simple API, adds a single high level `hydrate` function that is a drop in replacement for `render`.

## License
MIT

## Author
Alan Lawrey 2021