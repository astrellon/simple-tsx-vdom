import { assert } from "console";
import { ENETUNREACH } from "constants";
import { vdom, render } from ".";

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