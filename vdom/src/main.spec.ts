// Shouldn't need this reference but VSCode doesn't like no tsconfig.json in the root folder of a project.
/// <reference path="../node_modules/@types/jest/index.d.ts" />

import { vdom, render, ClassComponent, VirtualElement, VDom } from ".";

beforeEach(() =>
{
    VDom.current.clear();
});

test('basic', () =>
{
    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');
    const vdom1 = vdom('main', {id: 'mainId', key: 'main'},
        vdom('h1', {id: 'headerId'}, 'Hello'),
        vdom('p', {id: 'paragraphId', class: 'paragraph-class'}, 'Whats up?')
    );

    if (rootEl == null) { fail('Root element not created!'); }

    render(vdom1, rootEl);

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
    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');
    const vdom1 = vdom('main', {} ,
        vdom('div', {id: 'div1', style: {'background-color': 'red'}}, 'Hello'),
        vdom('div', {id: 'div2', style: {margin: '5px'}}, 'Whats up?')
    );

    if (rootEl == null) { fail('Root element not created!'); }

    render(vdom1, rootEl);

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

test('test class component with key', () =>
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

    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');
    const vdom1 = vdom('main', {id: 'mainId'},
        vdom(TestNode, {key: 'node1', name: 'Foo'}),
        vdom(TestNode, {key: 'node2', name: 'Bar'}),
        vdom(TestNode, {key: 'node3', name: 'Baz'})
    );

    if (rootEl == null) { fail('Root element not created!'); }

    render(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    const getChild = (index: number) =>
    {
        return mainEl.children.item(index) as Element;
    }

    expect(createdNodes.length).toBe(3);

    expect(createdNodes[0].renderCount).toBe(1);
    expect(createdNodes[0].props.name).toBe('Foo');
    expect(createdNodes[1].renderCount).toBe(1);
    expect(createdNodes[1].props.name).toBe('Bar');
    expect(createdNodes[2].renderCount).toBe(1);
    expect(createdNodes[2].props.name).toBe('Baz');

    expect(mainEl.children.length).toBe(3);
    expect(getChild(0).nodeName).toBe('SPAN');
    expect(getChild(0).innerHTML).toBe('TestNode: Foo');
    expect(getChild(1).nodeName).toBe('STRONG');
    expect(getChild(1).innerHTML).toBe('TestNode: Bar');
    expect(getChild(2).nodeName).toBe('STRONG');
    expect(getChild(2).innerHTML).toBe('TestNode: Baz');

    const vdom2 = vdom('main', {id: 'mainId'},
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

    const vdom3 = vdom('main', {id: 'mainId'},
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

    const vdom4 = vdom('main', {id: 'mainId'},
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

test('test class component without key', () =>
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

    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');
    const vdom1 = vdom('main', {id: 'mainId'},
        vdom(TestNode, { name: 'Foo' }),
        vdom(TestNode, { name: 'Bar' }),
        vdom(TestNode, { name: 'Baz' })
    );

    if (rootEl == null) { fail('Root element not created!'); }

    render(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    const getChild = (index: number) =>
    {
        return mainEl.children.item(index) as Element;
    }

    expect(createdNodes.length).toBe(3);

    expect(createdNodes[0].renderCount).toBe(1);
    expect(createdNodes[0].props.name).toBe('Foo');
    expect(createdNodes[1].renderCount).toBe(1);
    expect(createdNodes[1].props.name).toBe('Bar');
    expect(createdNodes[2].renderCount).toBe(1);
    expect(createdNodes[2].props.name).toBe('Baz');

    expect(mainEl.children.length).toBe(3);
    expect(getChild(0).nodeName).toBe('SPAN');
    expect(getChild(0).innerHTML).toBe('TestNode: Foo');
    expect(getChild(1).nodeName).toBe('STRONG');
    expect(getChild(1).innerHTML).toBe('TestNode: Bar');
    expect(getChild(2).nodeName).toBe('STRONG');
    expect(getChild(2).innerHTML).toBe('TestNode: Baz');

    const vdom2 = vdom('main', {id: 'mainId'},
        vdom(TestNode, { name: 'Baz' }),
        vdom(TestNode, { name: 'Bar' }),
        vdom(TestNode, { name: 'Foo' })
    );
    render(vdom2, rootEl);

    expect(createdNodes.length).toBe(3);
    expect(createdNodes[0].renderCount).toBe(2);
    expect(createdNodes[0].props.name).toBe('Baz');
    expect(createdNodes[1].renderCount).toBe(1);
    expect(createdNodes[1].props.name).toBe('Bar');
    expect(createdNodes[2].renderCount).toBe(2);
    expect(createdNodes[2].props.name).toBe('Foo');

    expect(mainEl.children.length).toBe(3);
    expect(getChild(0).nodeName).toBe('STRONG');
    expect(getChild(0).innerHTML).toBe('TestNode: Baz');
    expect(getChild(1).nodeName).toBe('STRONG');
    expect(getChild(1).innerHTML).toBe('TestNode: Bar');
    expect(getChild(2).nodeName).toBe('SPAN');
    expect(getChild(2).innerHTML).toBe('TestNode: Foo');

    const vdom3 = vdom('main', {id: 'mainId'},
        vdom(TestNode, { name: 'Baz' }),
        vdom(TestNode, { name: 'A new name' }),
        vdom(TestNode, { name: 'Foo' }),
        vdom(TestNode, { name: 'Boop' }),
    );
    render(vdom3, rootEl);

    expect(createdNodes.length).toBe(4);
    expect(createdNodes[0].renderCount).toBe(2);
    expect(createdNodes[0].props.name).toBe('Baz');
    expect(createdNodes[1].renderCount).toBe(2);
    expect(createdNodes[1].props.name).toBe('A new name');
    expect(createdNodes[2].renderCount).toBe(2);
    expect(createdNodes[2].props.name).toBe('Foo');
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

    const vdom4 = vdom('main', {id: 'mainId'},
        vdom(TestNode, { name: 'Baz' }),
        vdom(TestNode, { name: 'A new name' }),
    );
    render(vdom4, rootEl);

    expect(createdNodes.length).toBe(4);
    expect(createdNodes[0].renderCount).toBe(2);
    expect(createdNodes[0].props.name).toBe('Baz');
    expect(createdNodes[1].renderCount).toBe(2);
    expect(createdNodes[1].props.name).toBe('A new name');
    expect(createdNodes[2].renderCount).toBe(2);
    expect(createdNodes[2].props.name).toBe('Foo');
    expect(createdNodes[3].renderCount).toBe(1);
    expect(createdNodes[3].props.name).toBe('Boop');

    expect(mainEl.children.length).toBe(2);
    expect(getChild(0).nodeName).toBe('STRONG');
    expect(getChild(0).innerHTML).toBe('TestNode: Baz');
    expect(getChild(1).nodeName).toBe('SPAN');
    expect(getChild(1).innerHTML).toBe('TestNode: A new name');
});

test('event handling', () =>
{
    interface Props
    {
        readonly name: string;
    }

    class TestNode extends ClassComponent<Props>
    {
        public render(): VirtualElement
        {
            const { name } = this.props;

            return vdom(name[0] === 'B' ? 'strong' : 'span', {onclick: () => clicked2++ }, 'TestNode: ', name);
        }
    }

    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');
    let clicked1 = 0;
    let clicked2 = 0;

    const vdom1 = vdom('main', {id: 'mainId'},
        vdom('div', {onclick: () => { clicked1++; }}),
        vdom(TestNode, {name: 'Foo'})
    );

    if (rootEl == null) { fail('Root element not created!'); }

    render(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    const getChild = (index: number) =>
    {
        return mainEl.children.item(index) as HTMLElement;
    }

    getChild(0).click();
    getChild(0).click();
    getChild(1).click();

    expect(clicked1).toBe(2);
    expect(clicked2).toBe(1);

    const vdom2 = vdom('main', {id: 'mainId'},
        vdom('div', {onclick: () => { clicked1++; }}),
        vdom(TestNode, {name: 'Bar'})
    );

    render(vdom2, rootEl);

    getChild(0).click();
    getChild(0).click();
    getChild(1).click();

    expect(clicked1).toBe(4);
    expect(clicked2).toBe(2);

    const vdom3 = vdom('main', {id: 'mainId'},
        vdom('div', {}),
        vdom(TestNode, {name: 'Bar'})
    );
    render(vdom3, rootEl);

    getChild(0).click();
    getChild(0).click();
    getChild(1).click();

    expect(clicked1).toBe(4);
    expect(clicked2).toBe(3);
});

test('class mounting/unmounting', () =>
{
    interface Props
    {
        readonly name: string;
    }

    const createdNodes: TestNode[] = [];

    class TestNode extends ClassComponent<Props>
    {
        public mounted: boolean | undefined = undefined;

        constructor()
        {
            super();

            createdNodes.push(this);
        }

        onMount()
        {
            this.mounted = true;
        }

        onUnmount()
        {
            this.mounted = false;
        }

        public render(): VirtualElement
        {
            const { name } = this.props;

            return vdom('span', {}, 'TestNode: ', name);
        }
    }

    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');

    const vdom1 = vdom('main', {id: 'mainId'},
        vdom(TestNode, {name: 'Foo'}),
        vdom('div', {}),
        vdom(TestNode, {name: 'Bar'})
    );

    if (rootEl == null) { fail('Root element not created!'); }

    render(vdom1, rootEl);

    expect(createdNodes.length).toBe(2);
    expect(createdNodes[0].mounted).toBe(true);
    expect(createdNodes[1].mounted).toBe(true);

    const vdom2 = vdom('main', {id: 'mainId'},
        vdom(TestNode, {name: 'Foo'}),
        vdom('div', {}),
        vdom('p', {})
    );

    render(vdom2, rootEl);

    expect(createdNodes.length).toBe(2);
    expect(createdNodes[0].mounted).toBe(true);
    expect(createdNodes[1].mounted).toBe(false);
});

test('class with null', () =>
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

    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');
    const vdom1 = vdom('div', {id: 'mainId'},
        vdom(TestNode, {key: 'node1', name: 'Foo'}),
        vdom(TestNode, {key: 'node2', name: 'Bar'}),
        vdom(TestNode, {key: 'node3', name: 'Baz'})
    );

    if (rootEl == null) { fail('Root element not created!'); }

    render(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    const getChild = (index: number) =>
    {
        return mainEl.children.item(index) as Element;
    }

    expect(document.body.innerHTML).toBe('<main id="root"><div id="mainId"><span>TestNode: Foo</span></div></main>');

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

    expect(mainEl.children.length).toBe(1);
    expect(getChild(0).nodeName).toBe('SPAN');
    expect(getChild(0).innerHTML).toBe('TestNode: Foo');

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

    expect(mainEl.children.length).toBe(2);
    expect(getChild(0).nodeName).toBe('SPAN');
    expect(getChild(0).innerHTML).toBe('TestNode: A new name');
    expect(getChild(1).nodeName).toBe('SPAN');
    expect(getChild(1).innerHTML).toBe('TestNode: Foo');

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

test('force updating', () =>
{
    interface AppProps
    {
        readonly name: string;
    }

    let testComp: TestComp[] = [];

    let appRenderCount = 0;
    let compRenderCount = 0;
    let externalState = 'ExternalState';

    class App extends ClassComponent<AppProps>
    {
        public render(): VirtualElement
        {
            appRenderCount++;
            const { name } = this.props;

            return vdom('span', {}, 'App: ', name, this.children);
        }
    }

    class TestComp extends ClassComponent
    {
        constructor()
        {
            super();
            testComp.push(this);
        }

        public render(): VirtualElement
        {
            compRenderCount++;

            return vdom('span', { class: 'test-comp' }, 'TestNode: ', externalState);
        }
    }

    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');

    const vdom1 = vdom('main', {id: 'mainId'},
        vdom(App, {name: 'Foo'},
            vdom(TestComp, {}),
            vdom('div', {}))
    );

    if (rootEl == null) { fail('Root element not created!'); }

    render(vdom1, rootEl);

    expect(appRenderCount).toBe(1);
    expect(compRenderCount).toBe(1);
    expect(testComp.length).toBe(1);

    const testCompEl = document.querySelector('.test-comp');
    if (!testCompEl) { fail('Failed to find created test comp'); }

    expect(testCompEl.innerHTML).toBe('TestNode: ExternalState');

    const vdom2 = vdom('main', {id: 'mainId'},
        vdom(App, {name: 'Foo'},
            vdom(TestComp),
            vdom('div'))
    );

    render(vdom2, rootEl);

    expect(appRenderCount).toBe(1);
    expect(compRenderCount).toBe(1);
    expect(testComp.length).toBe(1);

    expect(testCompEl.innerHTML).toBe('TestNode: ExternalState');

    externalState = 'NewExternalState';
    testComp[0].forceUpdate();

    expect(appRenderCount).toBe(1);
    expect(compRenderCount).toBe(2);
    expect(testComp.length).toBe(1);

    expect(testCompEl.innerHTML).toBe('TestNode: NewExternalState');
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
    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');

    if (rootEl == null) { fail('Root element not created!'); }

    const vdom1 = vdom(App, {title: 'App', name: 'Foo', useWrapper: true});
    render(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    expect(mainEl.children.length).toBe(4);

    let headerEl = mainEl.children.item(0);
    if (headerEl == null) { fail('Could not find header element'); }
    expect(headerEl.nodeName).toBe('H1');
    expect(headerEl.innerHTML).toBe('Hello App');

    let testComp1El = mainEl.children.item(1);
    if (testComp1El == null) { fail('Could not find first test comp element'); }
    expect(testComp1El.nodeName).toBe('I');
    expect(testComp1El.innerHTML).toBe('My name is Const');

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
    expect(testComp2El.innerHTML).toBe('My name is Foo');

    const vdom2 = vdom(App, { title: 'App', name: 'Foo' });
    render(vdom2, rootEl);

    expect(mainEl.children.length).toBe(5);

    headerEl = mainEl.children.item(0);
    if (headerEl == null) { fail('Could not find header element'); }
    expect(headerEl.nodeName).toBe('H1');
    expect(headerEl.innerHTML).toBe('Hello App');

    testComp1El = mainEl.children.item(1);
    if (testComp1El == null) { fail('Could not find first test comp element'); }
    expect(testComp1El.nodeName).toBe('I');
    expect(testComp1El.innerHTML).toBe('My name is Const');

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
    expect(testComp2El.innerHTML).toBe('My name is Foo');
});

test('svg', () =>
{
    const Circle = () =>
        vdom('svg', {height: '100', width:'100', xmlns: 'http://www.w3.org/2000/svg'},
            vdom('circle', {cx: '50', cy: '50', r:'40', stroke:'black', 'stroke-width':'3', fill:'red'}));

    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');

    if (rootEl == null) { fail('Root element not created!'); }

    const vdom1 = vdom('main', {id: 'mainId'},
        vdom('span', {}, 'Before SVG'),
        vdom(Circle),
        vdom('span', {}, 'After SVG'));

    render(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    expect(mainEl.children.length).toBe(3);

    const span1El = mainEl.children.item(0);
    if (span1El == null) { fail('Could not find before span element'); }
    expect(span1El.nodeName).toBe('SPAN');
    expect(span1El.innerHTML).toBe('Before SVG');
    expect(span1El.namespaceURI).not.toBe('http://www.w3.org/2000/svg');

    const svgEl = mainEl.children.item(1);
    if (svgEl == null) { fail('Could not find svg element'); }
    expect(svgEl.nodeName).toBe('svg');
    expect(svgEl.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svgEl.children.length).toBe(1);

    const circleEl = svgEl.children.item(0);
    if (circleEl == null) { fail('Could not find circle element'); }
    expect(circleEl.nodeName).toBe('circle');
    expect(circleEl.namespaceURI).toBe('http://www.w3.org/2000/svg');

    const span2El = mainEl.children.item(2);
    if (span2El == null) { fail('Could not find after span element'); }
    expect(span2El.nodeName).toBe('SPAN');
    expect(span2El.innerHTML).toBe('After SVG');
    expect(span2El.namespaceURI).not.toBe('http://www.w3.org/2000/svg');
});

test('input', () =>
{
    interface InputProps
    {
        readonly checked: boolean;
    }

    const Input = (prop: InputProps) =>
        vdom('input', { type: 'checkbox', checked: prop.checked });

    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');

    if (rootEl == null) { fail('Root element not created!'); }

    const vdom1 = vdom('main', {id: 'mainId'},
        vdom(Input, {checked: true}),
        vdom(Input, {checked: false})
        );

    render(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    expect(mainEl.children.length).toBe(2);

    const input1El = mainEl.children.item(0) as HTMLInputElement;
    if (input1El == null) { fail('Could not find first input element'); }
    expect(input1El.nodeName).toBe('INPUT');
    expect(input1El.getAttribute('type')).toBe('checkbox');
    expect(input1El.checked).toBeTruthy();

    const input2El = mainEl.children.item(1) as HTMLInputElement;
    if (input2El == null) { fail('Could not find second input element'); }
    expect(input2El.nodeName).toBe('INPUT');
    expect(input2El.getAttribute('type')).toBe('checkbox');
    expect(input2El.checked).toBeFalsy();
});

test('select', () =>
{
    interface SelectProps
    {
        readonly selected: string;
    }

    const Select = (prop: SelectProps) =>
        vdom('select', { value: prop.selected },
            vdom('option', { value: 'opt1'}, 'Option 1'),
            vdom('option', { value: 'opt2'}, 'Option 2')
            );

    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');

    if (rootEl == null) { fail('Root element not created!'); }

    const vdom1 = vdom('main', {id: 'mainId'},
        vdom(Select, {selected: 'opt1'}),
        vdom(Select, {selected: 'opt2'})
        );

    render(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    expect(mainEl.children.length).toBe(2);

    const select1El = mainEl.children.item(0) as HTMLSelectElement;
    if (select1El == null) { fail('Could not find first select element'); }
    expect(select1El.nodeName).toBe('SELECT');
    expect(select1El.value).toBe('opt1');

    const select2El = mainEl.children.item(1) as HTMLSelectElement;
    if (select2El == null) { fail('Could not find second select element'); }
    expect(select2El.nodeName).toBe('SELECT');
    expect(select2El.value).toBe('opt2');
});

test('uncreated component', () =>
{
    interface Props
    {
        readonly name: string;
    }

    class TestNode extends ClassComponent<Props>
    {
        constructor()
        {
            super();
        }

        public render(): VirtualElement
        {
            const { name } = this.props;

            return vdom('span', {}, 'TestNode: ', name);
        }
    }

    const node = new TestNode();
    node.forceUpdate();
});

test('props check', () =>
{
    interface Props
    {
        readonly name: string;
        readonly age?: number;
    }

    class TestNode extends ClassComponent<Props>
    {
        constructor()
        {
            super();
        }

        public render(): VirtualElement
        {
            const { name, age } = this.props;

            return vdom('span', {}, 'TestNode: ', name, ' ', ((age != undefined) ? age : 'unknown'));
        }
    }

    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');

    if (rootEl == null) { fail('Root element not created!'); }

    const sameProps: Props = {
        name: 'Foo',
        age: 10
    }

    const vdom1 = vdom('main', {id: 'mainId'},
        vdom(TestNode, sameProps),
        vdom(TestNode, {name: 'Bar'})
        );

    render(vdom1, rootEl);

    const mainEl = document.getElementById('mainId');
    if (mainEl == null) { fail('Main element not created!'); }

    expect(mainEl.children.length).toBe(2);

    const node1El = mainEl.children.item(0) as HTMLSpanElement;
    if (node1El == null) { fail('Could not find first element'); }
    expect(node1El.nodeName).toBe('SPAN');
    expect(node1El.innerHTML).toBe('TestNode: Foo 10');

    const node2El = mainEl.children.item(1) as HTMLSpanElement;
    if (node2El == null) { fail('Could not find second element'); }
    expect(node2El.nodeName).toBe('SPAN');
    expect(node2El.innerHTML).toBe('TestNode: Bar unknown');

    const vdom2 = vdom('main', {id: 'mainId'},
        vdom(TestNode, sameProps),
        vdom(TestNode, {name: 'Bar', age: 20})
        );

    render(vdom2, rootEl);

    expect(node1El.nodeName).toBe('SPAN');
    expect(node1El.innerHTML).toBe('TestNode: Foo 10');

    expect(node2El.nodeName).toBe('SPAN');
    expect(node2El.innerHTML).toBe('TestNode: Bar 20');
});

test('clear', () =>
{
    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');

    if (rootEl == null) { fail('Root element not created!'); }

    const vdom1 = vdom('div', {class: 'div-class'},
        vdom('strong', {}, 'Bold Text'),
        vdom('span', {}, 'Normal Text')
        );

    render(vdom1, rootEl);

    expect(document.body.innerHTML).toBe('<main id="root"><div class="div-class"><strong>Bold Text</strong><span>Normal Text</span></div></main>');

    VDom.current.clear();

    expect(document.body.innerHTML).toBe('<main id="root"></main>');
});

test('insert start node', () =>
{
    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');

    if (rootEl == null) { fail('Root element not created!'); }

    const vdom1 = vdom('div', {class: 'div-class'},
        vdom('strong', {key: 'node1'}, 'Bold Text'),
        vdom('span', {key: 'node2'}, 'Normal Text')
        );

    render(vdom1, rootEl);

    expect(document.body.innerHTML).toBe('<main id="root"><div class="div-class"><strong>Bold Text</strong><span>Normal Text</span></div></main>');

    const vdom2 = vdom('div', {class: 'div-class'},
        vdom('i', {key: 'node3'}, 'Slanted'),
        vdom('strong', {key: 'node1'}, 'Bold Text'),
        vdom('span', {key: 'node2'}, 'Normal Text')
        );

    render(vdom2, rootEl);

    expect(document.body.innerHTML).toBe('<main id="root"><div class="div-class"><i>Slanted</i><strong>Bold Text</strong><span>Normal Text</span></div></main>');
});
