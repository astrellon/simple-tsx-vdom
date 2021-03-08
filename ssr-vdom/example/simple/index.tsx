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
    </nav>

const Footer: FunctionalComponent = () =>
    <footer>
        Alan Lawrey {new Date().getFullYear()}
    </footer>

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