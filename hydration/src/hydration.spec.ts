// Shouldn't need this reference but VSCode doesn't like no tsconfig.json in the root folder of a project.
/// <reference path="../node_modules/@types/jest/index.d.ts" />

import { vdom, render, ClassComponent, FunctionalComponent, VirtualElement } from "simple-tsx-vdom";
import { hydrate } from ".";

test('hydrate basic', () =>
{
    document.body.innerHTML = '<main id="root"><div class="div-class"><strong>Bold Text</strong><span>Normal Text</span></div></main>';
    const rootEl = document.getElementById('root');

    if (rootEl == null) { fail('Root element not created!'); }

    const vdom1 = vdom('div', {class: 'div-class'},
        vdom('strong', {key: 'node1'}, 'Bold Text'),
        vdom('span', {key: 'node2'}, 'Normal Text')
    );

    hydrate(vdom1, rootEl);

    expect(document.body.innerHTML).toBe('<main id="root"><div class="div-class"><strong>Bold Text</strong><span>Normal Text</span></div></main>');

    const vdom2 = vdom('div', {class: 'div-class'},
        vdom('i', {key: 'node3'}, 'Slanted'),
        vdom('strong', {key: 'node1'}, 'Bold Text'),
        vdom('span', {key: 'node2'}, 'Normal Text')
        );

    render(vdom2, rootEl);

    expect(document.body.innerHTML).toBe('<main id="root"><div class="div-class"><i>Slanted</i><strong>Bold Text</strong><span>Normal Text</span></div></main>');
});

test('hydrate class', () =>
{
    interface Props
    {
        readonly name: string;
    }

    const createdNodes: TestNode[] = [];

    class TestNode extends ClassComponent<Props>
    {
        public renderCount = 0;
        constructor()
        {
            super();
            createdNodes.push(this);
        }

        public render(): VirtualElement
        {
            this.renderCount++;

            const { name } = this.props;

            return vdom(name[0] === 'B' ? 'strong' : 'span', {}, 'TestNode: ', name);
        }
    }

    document.body.innerHTML = '<main id="root"><div id="mainId"><span>TestNode: <!-- -->Foo</span><strong>TestNode: <!-- -->Bar</strong><strong>TestNode: <!-- -->Baz</strong></div></main>';
    const rootEl = document.getElementById('root');
    const vdom1 = vdom('div', {id: 'mainId'},
        vdom(TestNode, {key: 'node1', name: 'Foo'}),
        vdom(TestNode, {key: 'node2', name: 'Bar'}),
        vdom(TestNode, {key: 'node3', name: 'Baz'})
    );

    if (rootEl == null) { fail('Root element not created!'); }

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    const getChild = (index: number) =>
    {
        return mainEl.children.item(index) as Element;
    }

    hydrate(vdom1, rootEl);

    expect(document.body.innerHTML).toBe('<main id="root"><div id="mainId"><span>TestNode: Foo</span><strong>TestNode: Bar</strong><strong>TestNode: Baz</strong></div></main>');

    expect(createdNodes.length).toBe(3);

    expect(createdNodes[0].renderCount).toBe(1);
    expect(createdNodes[0].props.name).toBe('Foo');
    expect(createdNodes[1].renderCount).toBe(1);
    expect(createdNodes[1].props.name).toBe('Bar');
    expect(createdNodes[2].renderCount).toBe(1);
    expect(createdNodes[2].props.name).toBe('Baz');

    const vdom2 = vdom('div', {id: 'mainId'},
        vdom(TestNode, {key: 'node3', name: 'Baz'}),
        vdom(TestNode, {key: 'node2', name: 'Bar'}),
        vdom(TestNode, {key: 'node1', name: 'Foo'})
    );

    render(vdom2, rootEl);

    expect(createdNodes.length).toBe(3);

    expect(createdNodes[0].renderCount).toBe(1);
    expect(createdNodes[0].props.name).toBe('Foo');
    expect(createdNodes[1].renderCount).toBe(1);
    expect(createdNodes[1].props.name).toBe('Bar');
    expect(createdNodes[2].renderCount).toBe(1);
    expect(createdNodes[2].props.name).toBe('Baz');

    expect(mainEl.children.length).toBe(3);
    expect(getChild(0).nodeName).toBe('STRONG');
    expect(getChild(0).innerHTML).toBe('TestNode: Baz');
    expect(getChild(1).nodeName).toBe('STRONG');
    expect(getChild(1).innerHTML).toBe('TestNode: Bar');
    expect(getChild(2).nodeName).toBe('SPAN');
    expect(getChild(2).innerHTML).toBe('TestNode: Foo');

    const vdom3 = vdom('div', {id: 'mainId'},
        vdom(TestNode, {key: 'node3', name: 'Baz'}),
        vdom(TestNode, {key: 'node2', name: 'A new name'}),
        vdom(TestNode, {key: 'node1', name: 'Foo'}),
        vdom(TestNode, {key: 'node4', name: 'Boop'}),
    );
    render(vdom3, rootEl);

    expect(createdNodes.length).toBe(4);
    expect(createdNodes[0].renderCount).toBe(1);
    expect(createdNodes[0].props.name).toBe('Foo');
    expect(createdNodes[1].renderCount).toBe(2);
    expect(createdNodes[1].props.name).toBe('A new name');
    expect(createdNodes[2].renderCount).toBe(1);
    expect(createdNodes[2].props.name).toBe('Baz');
    expect(createdNodes[3].renderCount).toBe(1);
    expect(createdNodes[3].props.name).toBe('Boop');

    expect(mainEl.children.length).toBe(4);
    expect(getChild(0).nodeName).toBe('STRONG');
    expect(getChild(0).innerHTML).toBe('TestNode: Baz');
    expect(getChild(1).nodeName).toBe('SPAN');
    expect(getChild(1).innerHTML).toBe('TestNode: A new name');
    expect(getChild(2).nodeName).toBe('SPAN');
    expect(getChild(2).innerHTML).toBe('TestNode: Foo');
    expect(getChild(3).nodeName).toBe('STRONG');
    expect(getChild(3).innerHTML).toBe('TestNode: Boop');

    const vdom4 = vdom('div', {id: 'mainId'},
        vdom(TestNode, {key: 'node3', name: 'Baz'}),
        vdom(TestNode, {key: 'node2', name: 'A new name'})
    );
    render(vdom4, rootEl);

    expect(createdNodes.length).toBe(4);
    expect(createdNodes[0].renderCount).toBe(1);
    expect(createdNodes[0].props.name).toBe('Foo');
    expect(createdNodes[1].renderCount).toBe(2);
    expect(createdNodes[1].props.name).toBe('A new name');
    expect(createdNodes[2].renderCount).toBe(1);
    expect(createdNodes[2].props.name).toBe('Baz');
    expect(createdNodes[3].renderCount).toBe(1);
    expect(createdNodes[3].props.name).toBe('Boop');

    expect(mainEl.children.length).toBe(2);
    expect(getChild(0).nodeName).toBe('STRONG');
    expect(getChild(0).innerHTML).toBe('TestNode: Baz');
    expect(getChild(1).nodeName).toBe('SPAN');
    expect(getChild(1).innerHTML).toBe('TestNode: A new name');
});

test('basic', () =>
{
    document.body.innerHTML = '<main id="root">' +
        '<main id="mainId">' +
            '<h1 id="headerId">Hello</h1>' +
            '<p id="paragraphId" class="paragraph-class">Whats up?</p>' +
        '</main>' +
    '</main>';
    const rootEl = document.getElementById('root');
    const vdom1 = vdom('main', {id: 'mainId', key: 'main'},
        vdom('h1', {id: 'headerId'}, 'Hello'),
        vdom('p', {id: 'paragraphId', class: 'paragraph-class'}, 'Whats up?')
    );

    if (rootEl == null) { fail('Root element not created!'); }

    hydrate(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    const headerEl = document.getElementById('headerId');
    const paragraphEl = document.getElementById('paragraphId');

    if (mainEl == null) { fail('Main element not created!'); }
    if (headerEl == null) { fail('Header element not created!'); }
    if (paragraphEl == null) { fail('Paragraph element not created!'); }

    expect(mainEl.children.length).toBe(2);
    expect(headerEl).toBe(mainEl.children.item(0));
    expect(paragraphEl).toBe(mainEl.children.item(1));
    expect(paragraphEl.classList.contains('paragraph-class')).toBeTruthy();

    expect(headerEl.innerHTML).toBe('Hello');
    expect(paragraphEl.innerHTML).toBe('Whats up?');

    const vdom2 = vdom('main', {id: 'mainId', key: 'main'},
        vdom('h1', {id: 'headerId'}, 'Hello there'),
        vdom('p', {id: 'paragraphId'}, 'Whats is up?'),
        vdom('div', {id: 'divId'}, 'Here is a number ', 0)
    );

    render(vdom2, rootEl);

    expect(mainEl.children.length).toBe(3);

    expect(headerEl.innerHTML).toBe('Hello there');
    expect(paragraphEl.innerHTML).toBe('Whats is up?');
    expect(paragraphEl.classList.contains('paragraph-class')).toBeFalsy();

    const divEl = document.getElementById('divId');
    if (divEl == null) { fail('Div element not created!'); }

    expect(divEl.innerHTML).toBe('Here is a number 0');

});

test('styles', () =>
{
    document.body.innerHTML = '<main id="root">' +
        '<main>' +
            '<div id="div1" style="background-color: red;">Hello</div>' +
            '<div id="div2" style="margin: 5px;">Whats up?</div>' +
        '</main>' +
    '</main>';
    const rootEl = document.getElementById('root');
    const vdom1 = vdom('main', {} ,
        vdom('div', {id: 'div1', style: {'background-color': 'red'}}, 'Hello'),
        vdom('div', {id: 'div2', style: {margin: '5px'}}, 'Whats up?')
    );

    if (rootEl == null) { fail('Root element not created!'); }

    hydrate(vdom1, rootEl);

    const div1El = document.getElementById('div1');
    const div2El = document.getElementById('div2');

    if (div1El == null) { fail('Div 1 element not created!'); }
    if (div2El == null) { fail('Div 2 element not created!'); }

    expect(div1El.innerHTML).toBe('Hello');
    expect(div2El.innerHTML).toBe('Whats up?');

    expect(div1El.style.backgroundColor).toBe('red');
    expect(div2El.style.backgroundColor).toBe('');

    expect(div1El.style.margin).toBe('');
    expect(div2El.style.margin).toBe('5px');

    const vdom2 = vdom('main', {} ,
        vdom('div', {id: 'div1', style: {'background-color': 'green', margin: '7px'}}, 'Hello'),
        vdom('div', {id: 'div2', style: {}}, 'Whats up?')
    );

    render(vdom2, rootEl);

    expect(div1El.style.backgroundColor).toBe('green');
    expect(div2El.style.backgroundColor).toBe('');

    expect(div1El.style.margin).toBe('7px');
    expect(div2El.style.margin).toBe('');

    const vdom3 = vdom('main', {} ,
        vdom('div', {id: 'div1', style: {padding: '7px'}}, 'Hello'),
        vdom('div', {id: 'div2', style: {position: 'absolute'}}, 'Whats up?')
    );

    render(vdom3, rootEl);

    expect(div1El.style.backgroundColor).toBe('');
    expect(div2El.style.backgroundColor).toBe('');

    expect(div1El.style.margin).toBe('');
    expect(div2El.style.margin).toBe('');

    expect(div1El.style.padding).toBe('7px');
    expect(div2El.style.padding).toBe('');

    expect(div1El.style.position).toBe('');
    expect(div2El.style.position).toBe('absolute');
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
        return vdom('i', {}, `My name is ${props.name}`);
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
            vdom('h1', {}, `Hello ${props.title}`),
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
        '<main id="mainId">' +
            '<h1>Hello <!-- -->App</h1>' +
            '<i>My name is <!-- -->Const</i>' +
            '<div class="wrapper-class">' +
                '<span>Wrapped 1</span>' +
                '<span>Wrapped 2</span>' +
            '</div>' +
            '<i>My name is <!-- -->Foo</i>' +
        '</main>' +
    '</main>';

    const rootEl = document.getElementById('root');

    if (rootEl == null) { fail('Root element not created!'); }

    const vdom1 = vdom(App, {title: 'App', name: 'Foo', useWrapper: true});
    hydrate(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    expect(mainEl.children.length).toBe(4);

    let headerEl = mainEl.children.item(0);
    if (headerEl == null) { fail('Could not find header element'); }
    expect(headerEl.nodeName).toBe('H1');
    expect(headerEl.innerHTML).toBe('Hello <!-- -->App');

    let testComp1El = mainEl.children.item(1);
    if (testComp1El == null) { fail('Could not find first test comp element'); }
    expect(testComp1El.nodeName).toBe('I');
    expect(testComp1El.innerHTML).toBe('My name is <!-- -->Const');

    let wrapperEl = mainEl.children.item(2);
    if (wrapperEl == null) { fail('Could not find wrapper element'); }
    expect(wrapperEl.children.length).toBe(2);
    expect(wrapperEl.classList.contains('wrapper-class')).toBeTruthy();

    let wrapped1El = wrapperEl.children.item(0);
    if (wrapped1El == null) { fail('Could not find wrapped 1 element'); }
    expect(wrapped1El.nodeName).toBe('SPAN');
    expect(wrapped1El.innerHTML).toBe('Wrapped 1');

    let wrapped2El = wrapperEl.children.item(1);
    if (wrapped2El == null) { fail('Could not find wrapped 2 element'); }
    expect(wrapped2El.nodeName).toBe('SPAN');
    expect(wrapped2El.innerHTML).toBe('Wrapped 2');

    let testComp2El = mainEl.children.item(3);
    if (testComp2El == null) { fail('Could not find second test comp element'); }
    expect(testComp2El.nodeName).toBe('I');
    expect(testComp2El.innerHTML).toBe('My name is <!-- -->Foo');

    const vdom2 = vdom(App, { title: 'App', name: 'Bar' });
    render(vdom2, rootEl);

    expect(mainEl.children.length).toBe(5);

    headerEl = mainEl.children.item(0);
    if (headerEl == null) { fail('Could not find header element'); }
    expect(headerEl.nodeName).toBe('H1');
    expect(headerEl.innerHTML).toBe('Hello <!-- -->App');

    testComp1El = mainEl.children.item(1);
    if (testComp1El == null) { fail('Could not find first test comp element'); }
    expect(testComp1El.nodeName).toBe('I');
    expect(testComp1El.innerHTML).toBe('My name is <!-- -->Const');

    wrapped1El = mainEl.children.item(2);
    if (wrapped1El == null) { fail('Could not find not wrapped 1 element'); }
    expect(wrapped1El.nodeName).toBe('SPAN');
    expect(wrapped1El.innerHTML).toBe('Not wrapped 1');

    wrapped2El = mainEl.children.item(3);
    if (wrapped2El == null) { fail('Could not find not wrapped 2 element'); }
    expect(wrapped2El.nodeName).toBe('SPAN');
    expect(wrapped2El.innerHTML).toBe('Not wrapped 2');

    testComp2El = mainEl.children.item(4);
    if (testComp2El == null) { fail('Could not find test comp element'); }
    expect(testComp2El.nodeName).toBe('I');
    expect(testComp2El.innerHTML).toBe('My name is Bar');
});

test('hydrate with null', () =>
{
    interface Props
    {
        readonly name: string;
    }

    const createdNodes: TestNode[] = [];

    class TestNode extends ClassComponent<Props>
    {
        public renderCount = 0;
        constructor()
        {
            super();
            createdNodes.push(this);
        }

        public render()
        {
            this.renderCount++;

            const { name } = this.props;

            if (name[0] === 'B') return null;

            return vdom('span', {}, 'TestNode: ', name);
        }
    }

    const TestFunc: FunctionalComponent<Props> = (props: Props) =>
    {
        const { name } = props;

        if (name[0] === 'B') return null;

        return vdom('strong', {}, 'TestFunc: ', name);
    }

    document.body.innerHTML = '<main id="root">' +
        '<div id="mainId">' +
           '<span>TestNode: <!-- -->Foo</span>' +
           '<strong>TestFunc: <!-- -->Qwerty</strong>' +
        '</div>' +
    '</main>';

    const rootEl = document.getElementById('root');
    const vdom1 = vdom('div', {id: 'mainId'},
        vdom(TestNode, {key: 'node1', name: 'Foo'}),
        vdom(TestNode, {key: 'node2', name: 'Bar'}),
        vdom(TestNode, {key: 'node3', name: 'Baz'}),
        vdom(TestFunc, {key: 'node5', name: 'Blerty'}),
        vdom(TestFunc, {key: 'node4', name: 'Qwerty'})
    );

    if (rootEl == null) { fail('Root element not created!'); }

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    const getChild = (index: number) =>
    {
        return mainEl.children.item(index) as Element;
    }

    hydrate(vdom1, rootEl);

    expect(document.body.innerHTML).toBe('<main id="root">' +
        '<div id="mainId">' +
            '<span>TestNode: Foo</span>' +
            '<strong>TestFunc: Qwerty</strong>' +
        '</div>' +
    '</main>');

    expect(createdNodes.length).toBe(3);

    expect(createdNodes[0].renderCount).toBe(1);
    expect(createdNodes[0].props.name).toBe('Foo');
    expect(createdNodes[1].renderCount).toBe(1);
    expect(createdNodes[1].props.name).toBe('Bar');
    expect(createdNodes[2].renderCount).toBe(1);
    expect(createdNodes[2].props.name).toBe('Baz');

    const vdom2 = vdom('div', {id: 'mainId'},
        vdom(TestNode, {key: 'node3', name: 'Baz'}),
        vdom(TestNode, {key: 'node2', name: 'Bar'}),
        vdom(TestNode, {key: 'node1', name: 'Foo'}),
        vdom(TestFunc, {key: 'node5', name: 'Blerty'}),
        vdom(TestFunc, {key: 'node4', name: 'Qwerty'})
    );

    render(vdom2, rootEl);

    expect(createdNodes.length).toBe(3);

    expect(createdNodes[0].renderCount).toBe(1);
    expect(createdNodes[0].props.name).toBe('Foo');
    expect(createdNodes[1].renderCount).toBe(1);
    expect(createdNodes[1].props.name).toBe('Bar');
    expect(createdNodes[2].renderCount).toBe(1);
    expect(createdNodes[2].props.name).toBe('Baz');

    expect(mainEl.children.length).toBe(2);
    expect(getChild(0).nodeName).toBe('SPAN');
    expect(getChild(0).innerHTML).toBe('TestNode: Foo');
    expect(getChild(1).nodeName).toBe('STRONG');
    expect(getChild(1).innerHTML).toBe('TestFunc: Qwerty');

    const vdom3 = vdom('div', {id: 'mainId'},
        vdom(TestNode, {key: 'node3', name: 'Baz'}),
        vdom(TestNode, {key: 'node2', name: 'A new name'}),
        vdom(TestNode, {key: 'node1', name: 'Foo'}),
        vdom(TestNode, {key: 'node4', name: 'Boop'}),
        vdom(TestFunc, {key: 'node5', name: 'Ylerty'}),
    );
    render(vdom3, rootEl);

    expect(createdNodes.length).toBe(4);
    expect(createdNodes[0].renderCount).toBe(1);
    expect(createdNodes[0].props.name).toBe('Foo');
    expect(createdNodes[1].renderCount).toBe(2);
    expect(createdNodes[1].props.name).toBe('A new name');
    expect(createdNodes[2].renderCount).toBe(1);
    expect(createdNodes[2].props.name).toBe('Baz');
    expect(createdNodes[3].renderCount).toBe(1);
    expect(createdNodes[3].props.name).toBe('Boop');

    expect(mainEl.children.length).toBe(3);
    expect(getChild(0).nodeName).toBe('SPAN');
    expect(getChild(0).innerHTML).toBe('TestNode: A new name');
    expect(getChild(1).nodeName).toBe('SPAN');
    expect(getChild(1).innerHTML).toBe('TestNode: Foo');
    expect(getChild(2).nodeName).toBe('STRONG');
    expect(getChild(2).innerHTML).toBe('TestFunc: Ylerty');

    const vdom4 = vdom('div', {id: 'mainId'},
        vdom(TestNode, {key: 'node3', name: 'Baz'}),
        vdom(TestNode, {key: 'node2', name: 'A new name'})
    );
    render(vdom4, rootEl);

    expect(createdNodes.length).toBe(4);
    expect(createdNodes[0].renderCount).toBe(1);
    expect(createdNodes[0].props.name).toBe('Foo');
    expect(createdNodes[1].renderCount).toBe(2);
    expect(createdNodes[1].props.name).toBe('A new name');
    expect(createdNodes[2].renderCount).toBe(1);
    expect(createdNodes[2].props.name).toBe('Baz');
    expect(createdNodes[3].renderCount).toBe(1);
    expect(createdNodes[3].props.name).toBe('Boop');

    expect(mainEl.children.length).toBe(1);
    expect(getChild(0).nodeName).toBe('SPAN');
    expect(getChild(0).innerHTML).toBe('TestNode: A new name');
});

test('nested classes', () =>
{
    interface PropsInner
    {
        readonly name: string;
    }

    class Inner extends ClassComponent<PropsInner>
    {
        public render()
        {
            return vdom('strong', {}, `Name: ${this.props.name}`);
        }
    }

    interface PropsOuter
    {
        readonly name: string;
    }

    class Outer extends ClassComponent<PropsOuter>
    {
        public render()
        {
            return vdom(Inner, {name: this.props.name});
        }
    }

    document.body.innerHTML = '<main id="root"><div><strong>Name: Foo</strong></div></main>';
    const rootEl = document.getElementById('root');

    if (rootEl == null) { fail('Root element not created!'); }

    const vdom1 = vdom('div', {},
        vdom(Outer, {name: 'Foo'}),
    );

    hydrate(vdom1, rootEl);

    expect(document.body.innerHTML).toBe('<main id="root"><div><strong>Name: Foo</strong></div></main>');

    const vdom2 = vdom('div', {},
        vdom(Outer, {name: 'Bar'}),
    );

    render(vdom2, rootEl);

    expect(document.body.innerHTML).toBe('<main id="root"><div><strong>Name: Bar</strong></div></main>');
});