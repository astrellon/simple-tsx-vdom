// Shouldn't need this reference but VSCode doesn't like no tsconfig.json in the root folder of a project.
/// <reference path="../node_modules/@types/jest/index.d.ts" />

import { vdom, render, VirtualElement, VDom } from "simple-tsx-vdom";
import { SSRDomDocument } from ".";

beforeAll(() =>
{
    const ssrDomDocument = new SSRDomDocument();
    const ssrVDom = new VDom(ssrDomDocument);
    VDom.current = ssrVDom;
});

beforeEach(() =>
{
    VDom.current.clear();
});

test('basic', () =>
{
    const vdom1 = vdom('main', {id: 'mainId', key: 'main'},
        vdom('h1', {id: 'headerId'}, 'Hello'),
        vdom('p', {id: 'paragraphId', class: 'paragraph-class'}, 'Whats up?')
    );

    const parent = SSRDomDocument.emptyElement();

    render(vdom1, parent);

    expect(parent.hydrateToString()).toBe('<main id="mainId">' +
        '<h1 id="headerId">Hello</h1>' +
        '<p id="paragraphId" class="paragraph-class">Whats up?</p>' +
    '</main>');

    expect(parent.renderToString()).toBe('<main id="mainId">' +
        '<h1 id="headerId">Hello</h1>' +
        '<p id="paragraphId" class="paragraph-class">Whats up?</p>' +
    '</main>');
});

test('style', () =>
{
    const vdom1 = vdom('main', {} ,
        vdom('div', {id: 'div1', style: {'background-color': 'red'}}, 'Hello'),
        vdom('div', {id: 'div2', style: {margin: '5px'}}, 'Whats up?')
    );

    const parent = SSRDomDocument.emptyElement();

    render(vdom1, parent);

    expect(parent.hydrateToString()).toBe('<main>' +
        '<div id="div1" style="background-color:red;">Hello</div>' +
        '<div id="div2" style="margin:5px;">Whats up?</div>' +
    '</main>');

    expect(parent.renderToString()).toBe('<main>' +
        '<div id="div1" style="background-color:red;">Hello</div>' +
        '<div id="div2" style="margin:5px;">Whats up?</div>' +
    '</main>');
});

test('functional component', () =>
{
    interface AppProps
    {
        readonly title: string;
        readonly name: string;
        readonly useWrapper?: boolean;
    }
    interface WrapperProps
    {
        readonly className: string;
    }
    interface CompProps
    {
        readonly name: string;
    }

    const TestComp = (props: CompProps, children: VirtualElement[]) =>
    {
        return vdom('i', {}, 'My name is ', props.name);
    }

    const Wrapper = (props: WrapperProps, children: VirtualElement[]) =>
    {
        return vdom('div', {class: props.className}, children);
    }

    const firstCompProps: CompProps = {
        name: 'Const'
    }

    const App = (props: AppProps, children: VirtualElement[]) =>
    {
        return vdom('main', {id: 'mainId'},
            vdom('h1', {}, 'Hello ', props.title),
            vdom(TestComp, firstCompProps),
            (props.useWrapper ?
                vdom(Wrapper, { className: 'wrapper-class' },
                    vdom('span', undefined, 'Wrapped 1'),
                    vdom('span', undefined, 'Wrapped 2'))
                    :
                [ vdom('span', {}, 'Not wrapped 1'),
                vdom('span', {}, 'Not wrapped 2')]
            ),
            vdom(TestComp, {name: props.name}));
    }
    document.body.innerHTML = '<main id="root">' +
         +
    '</main>';

    const parent = SSRDomDocument.emptyElement();

    const vdom1 = vdom(App, {title: 'App', name: 'Foo', useWrapper: true});
    render(vdom1, parent);

    expect(parent.hydrateToString()).toBe('<main id="mainId">' +
        '<h1>Hello <!-- -->App</h1>' +
        '<i>My name is <!-- -->Const</i>' +
        '<div class="wrapper-class">' +
            '<span>Wrapped 1</span>' +
            '<span>Wrapped 2</span>' +
        '</div>' +
        '<i>My name is <!-- -->Foo</i>' +
    '</main>');

    expect(parent.renderToString()).toBe('<main id="mainId">' +
        '<h1>Hello App</h1>' +
        '<i>My name is Const</i>' +
        '<div class="wrapper-class">' +
            '<span>Wrapped 1</span>' +
            '<span>Wrapped 2</span>' +
        '</div>' +
        '<i>My name is Foo</i>' +
    '</main>');
});

test('svg', () =>
{
    const Circle = () =>
        vdom('svg', {height: '100', width:'100', xmlns: 'http://www.w3.org/2000/svg'},
            vdom('circle', {cx: '50', cy: '50', r:'40', stroke:'black', 'stroke-width':'3', fill:'red'}));

    const vdom1 = vdom('main', {id: 'mainId'},
        vdom('span', {}, 'Before SVG'),
        vdom(Circle),
        vdom('span', {}, 'After SVG'));

    const parent = SSRDomDocument.emptyElement();

    render(vdom1, parent);

    expect(parent.hydrateToString()).toBe('<main id="mainId">' +
        '<span>Before SVG</span>' +
        '<svg xmlns="http://www.w3.org/2000/svg" height="100" width="100">' +
            '<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"/>' +
        '</svg>' +
        '<span>After SVG</span>' +
    '</main>');

    expect(parent.renderToString()).toBe('<main id="mainId">' +
        '<span>Before SVG</span>' +
        '<svg xmlns="http://www.w3.org/2000/svg" height="100" width="100">' +
            '<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"/>' +
        '</svg>' +
        '<span>After SVG</span>' +
    '</main>');
});