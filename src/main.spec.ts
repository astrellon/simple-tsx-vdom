import { vdom, render, VDomComponent, VirtualElement, Props } from ".";

test('basic test', () =>
{
    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');
    const vdom1 = vdom('main', {id: 'mainId'},
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

    const vdom2 = vdom('main', {id: 'mainId'},
        vdom('h1', {id: 'headerId'}, 'Hello there'),
        vdom('p', {id: 'paragraphId'}, 'Whats is up?')
    );

    render(vdom2, rootEl);

    expect(headerEl.innerHTML).toBe('Hello there');
    expect(paragraphEl.innerHTML).toBe('Whats is up?');
    expect(paragraphEl.classList.contains('paragraph-class')).toBeFalsy();
});

test('test class component with key', () =>
{
    interface Props
    {
        readonly name: string;
    }

    const createdNodes: TestNode[] = [];

    class TestNode extends VDomComponent<Props>
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

    class TestNode extends VDomComponent<Props>
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

    class TestNode extends VDomComponent<Props>
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

    class TestNode extends VDomComponent<Props>
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

    class App extends VDomComponent<AppProps>
    {
        public render(): VirtualElement
        {
            appRenderCount++;
            const { name } = this.props;

            return vdom('span', {}, 'App: ', name, this.children);
        }
    }

    class TestComp extends VDomComponent
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
        readonly useWrapper: boolean;
    }
    interface CompProps
    {
        readonly name: string;
    }

    const TestComp = (props: CompProps, children: VirtualElement[]) =>
    {
        return vdom('i', {}, `My name is ${props.name}`);
    }

    const Wrapper = (props: any, children: VirtualElement[]) =>
    {
        return vdom('div', {class: 'wrapper-class'}, children);
    }

    const App = (props: AppProps, children: VirtualElement[]) =>
    {
        return vdom('main', {id: 'mainId'},
            vdom('h1', {}, `Hello ${props.title}`),
            (props.useWrapper ?
                vdom(Wrapper, {},
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

    expect(mainEl.children.length).toBe(3);

    let headerEl = mainEl.children.item(0);
    if (headerEl == null) { fail('Could not find header element'); }
    expect(headerEl.nodeName).toBe('H1');
    expect(headerEl.innerHTML).toBe('Hello App');

    let wrapperEl = mainEl.children.item(1);
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

    let testCompEl = mainEl.children.item(2);
    if (testCompEl == null) { fail('Could not find test comp element'); }
    expect(testCompEl.nodeName).toBe('I');
    expect(testCompEl.innerHTML).toBe('My name is Foo');

    const vdom2 = vdom(App, {title: 'App', name: 'Foo', useWrapper: false});
    render(vdom2, rootEl);

    expect(mainEl.children.length).toBe(4);

    headerEl = mainEl.children.item(0);
    if (headerEl == null) { fail('Could not find header element'); }
    expect(headerEl.nodeName).toBe('H1');
    expect(headerEl.innerHTML).toBe('Hello App');

    wrapped1El = mainEl.children.item(1);
    if (wrapped1El == null) { fail('Could not find not wrapped 1 element'); }
    expect(wrapped1El.nodeName).toBe('SPAN');
    expect(wrapped1El.innerHTML).toBe('Not wrapped 1');

    wrapped2El = mainEl.children.item(2);
    if (wrapped2El == null) { fail('Could not find not wrapped 2 element'); }
    expect(wrapped2El.nodeName).toBe('SPAN');
    expect(wrapped2El.innerHTML).toBe('Not wrapped 2');

    testCompEl = mainEl.children.item(3);
    if (testCompEl == null) { fail('Could not find test comp element'); }
    expect(testCompEl.nodeName).toBe('I');
    expect(testCompEl.innerHTML).toBe('My name is Foo');
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