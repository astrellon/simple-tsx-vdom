// Shouldn't need this reference but VSCode doesn't like no tsconfig.json in the root folder of a project.
/// <reference path="../node_modules/@types/jest/index.d.ts" />

import { vdom, render, ClassComponent, VirtualElement } from "simple-tsx-vdom";
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

    document.body.innerHTML = '<main id="root"><div id="mainId"><span>TestNode: <!-- -->Foo</span></div></main>';
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