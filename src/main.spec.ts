import { vdom, render, VDomComponent, VirtualElement } from ".";

test('basic test', () =>
{
    document.body.innerHTML = '<main id="root"></main>';
    const rootEl = document.getElementById('root');
    console.log('Root El', rootEl);
    const vdom1 = vdom('main', {id: 'mainId'},
        vdom('h1', {id: 'headerId'}, 'Hello'),
        vdom('p', {id: 'paragraphId'}, 'Whats up?')
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

    expect(headerEl.innerHTML).toBe('Hello');
    expect(paragraphEl.innerHTML).toBe('Whats up?');

    const vdom2 = vdom('main', {id: 'mainId'},
        vdom('h1', {id: 'headerId'}, 'Hello there'),
        vdom('p', {id: 'paragraphId'}, 'Whats is up?')
    );

    render(vdom2, rootEl);

    expect(headerEl.innerHTML).toBe('Hello there');
    expect(paragraphEl.innerHTML).toBe('Whats is up?');
});

test('test class component', () =>
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
    console.log('Root El', rootEl);
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
})