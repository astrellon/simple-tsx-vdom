import { createChildKey, createComponentKey, DomElement, isClassNode, isFunctionalNode, isIntrinsicNode, isTextNode, VDom, VirtualClassElement, VirtualElement, VirtualFunctionalElement, VirtualIntrinsicElement, VirtualTextElement } from "simple-tsx-vdom";

//// Hydration

// Hydration is the process of linking up existing elements with the virtual DOM.
// This allows us to create the DOM somewhere else (like on the server) and then reuse
// the elements rather than having to blow away the work done by the browser and server.
// Most important on lower-powered devices. In someways it does mean a larger initial payload because
// it'll contain the HTML, but it also means that the browser should be able to display the initial payload
// before the scripts have finished loading/parsing.
function hydrateDom(vdomInstance: VDom, parentNode: DomElement, vNode: VirtualElement | undefined | null, key: string, domIndex: number): boolean
{
    if (vNode == null)
    {
        return false;
    }

    if (isTextNode(vNode))
    {
        return hydrateTextNode(vdomInstance, parentNode, vNode, key, domIndex);
    }
    else if (isClassNode(vNode))
    {
        return hydrateClassNode(vdomInstance, parentNode, vNode, key, domIndex);
    }
    else if (isFunctionalNode(vNode))
    {
        return hydrateFunctionalNode(vdomInstance, parentNode, vNode, key, domIndex);
    }
    else if (isIntrinsicNode(vNode))
    {
        return hydrateIntrinsicNode(vdomInstance, parentNode, vNode, key, domIndex);
    }

    return false;
}

function hydrateTextNode(vdomInstance: VDom, parentNode: DomElement, vNode: VirtualTextElement, key: string, domIndex: number)
{
    const domNode = parentNode.childNodes.item(domIndex);
    vdomInstance.vdomData[key] = { domNode, vNode };

    return true;
}

function hydrateFunctionalNode(vdomInstance: VDom, parentNode: DomElement, vNode: VirtualFunctionalElement, key: string, domIndex: number)
{
    const functionalChildKey = createComponentKey(key);
    const hydrated = hydrateDom(vdomInstance, parentNode, vNode.func(vNode.props, vNode.children), functionalChildKey, domIndex);
    vdomInstance.vdomData[key] = { vNode }

    return hydrated;
}

function hydrateClassNode(vdomInstance: VDom, parentNode: DomElement, vNode: VirtualClassElement, key: string, domIndex: number)
{
    const inst = new vNode.ctor();
    inst.vdomKey = createComponentKey(key);
    inst.vdom = vdomInstance;

    vdomInstance.vdomData[key] = { vNode, instance: inst }

    const renderedVNode = inst.internalRender(vNode.props, vNode.children);
    let hydrated = false;
    if (renderedVNode)
    {
        hydrated = hydrateDom(vdomInstance, parentNode, renderedVNode, inst.vdomKey, domIndex);
    }

    inst.prevRenderedResult = hydrated;

    inst.onMount();

    return hydrated;
}

function hydrateIntrinsicNode(vdomInstance: VDom, parentNode: DomElement, vNode: VirtualIntrinsicElement, key: string, domIndex: number)
{
    const domElement = parentNode.childNodes.item(domIndex) as DomElement;
    vdomInstance.vdomData[key] = { domNode: domElement, vNode };

    for (let childIndex = 0, childDomIndex = 0; childIndex < vNode.children.length; childIndex++, childDomIndex++)
    {
        let childDomNode;

        while ((childDomNode = domElement.childNodes.item(childDomIndex)) && childDomNode.nodeType === Node.COMMENT_NODE)
        {
            domElement.removeChild(domElement.childNodes.item(childDomIndex));
        }

        const child = vNode.children[childIndex];
        const childKey = createChildKey(child, key, childIndex);

        // If the hydration doesn't happen (should only be because of undefined/null from a functional or class component), then stay in place for checking the dom.
        if (!hydrateDom(vdomInstance, domElement, child, childKey, childDomIndex))
        {
            childDomIndex--;
        }
    }

    vdomInstance.applyEventListeners(domElement, undefined, vNode.listeners);
    vdomInstance.applyProperties(domElement, undefined, vNode.properties);

    return true;
}

export function hydrate(virtualNode: VirtualElement, parent: HTMLElement, vdomInstance?: VDom)
{
    vdomInstance = vdomInstance || VDom.current;
    hydrateDom(vdomInstance, parent, virtualNode, vdomInstance.rootKey, 0);
}