// How we want our virtual elements to look like
interface IVirtualContainerElement
{
    // Properties of the this virtual DOM element.
    readonly props: Props;

    // Children can be text or another object element.
    // We need the text special type otherwise we wouldn't have a way to specify text.
    readonly children: VirtualElement[];
}

interface VirtualIntrinsicElement extends IVirtualContainerElement
{
    type: 'intrinsic';

    // The name of the node type ('div', 'span', etc)
    readonly nodeType: string;
}

interface VirtualComplexElement extends IVirtualContainerElement
{
    type: 'complex';

    readonly create: CreateNode;
}

interface VirtualTextElement
{
    type: 'text';

    readonly text: string;
}

type VirtualElement = VirtualComplexElement | VirtualIntrinsicElement | VirtualTextElement;

// Our properties/attributes are just a map of string keys to any value at the moment.
interface Props
{
    readonly [key: string]: any;
}

interface AttributeDiff
{
    attribute: string;
    value: any;
    add: boolean;
}
interface AttributeDiffs
{
    [key: string]: AttributeDiff;
}

// A virtual node is either and element above or plain text.
export type VirtualNode = VirtualElement | string | number | boolean;
export type CreateNode = (props: any) => VirtualElement;
export type VirtualNodeType = string | CreateNode;

interface VDomData
{
    readonly domNode: Node;
    readonly vNode: VirtualElement;
}
interface VDomDataStore { [vdomKey: string]: VDomData };

const vdomData: VDomDataStore = { }

function addAttributes(htmlElement: HTMLElement, props: Props)
{
    for (const prop in props)
    {
        addAttribute(htmlElement, prop, props[prop]);
    }
}

function addAttribute(htmlElement: HTMLElement, attribute: string, value: string | EventListener)
{
    // Check if the string starts with the letters 'on'.
    // Note this function is not available in Internet Explorer.
    if (attribute.startsWith('on') && typeof(value) === 'function')
    {
        // Chop off the first two characters and use the rest as the event listener type.
        // Note: This is *not* the correct way to do this.
        // It'll pick on anything that starts with 'on', like 'onion' or 'once'.
        // Also we're not checking if the value is actually a function.
        // For now to get a working example UI we'll go with it.
        htmlElement.addEventListener(attribute.substr(2), value);
    }
    else
    {
        // setAttribute is used for any attribute on an element such as class, value, src, etc.
        htmlElement.setAttribute(attribute, value.toString());
    }
}

function removeAttribute(htmlElement: HTMLElement, attribute: string, listener?: EventListener)
{
    // Check if the string starts with the letters 'on'.
    // Note this function is not available in Internet Explorer.
    if (attribute.startsWith('on') && typeof(listener) === 'function')
    {
        htmlElement.removeEventListener(attribute.substr(2), listener);
    }
    else
    {
        htmlElement.removeAttribute(attribute);
    }
}

function applyAttributes(htmlElement: HTMLElement, currentProps: Props, newProps: Props)
{
    const attrs: AttributeDiffs = {};
    for (const prop in currentProps)
    {
        const currentProp = currentProps[prop];
        attrs[prop] = {
            add: false,
            attribute: prop,
            value: currentProp
        }
    }

    for (const prop in newProps)
    {
        const currentAttr = attrs[prop];
        const newProp = newProps[prop];
        if (currentAttr && currentAttr.value === newProp)
        {
            delete attrs[prop];
            continue;
        }

        attrs[prop] = {
            add: true,
            attribute: prop,
            value: newProp
        }
    }

    for (const prop in attrs)
    {
        const attr = attrs[prop];
        if (attr.add)
        {
            addAttribute(htmlElement, prop, attr.value);
        }
        else
        {
            removeAttribute(htmlElement, prop, attr.value);
        }
    }
}

function removeNode(htmlElement?: Node)
{
    if (!htmlElement) return;

    htmlElement.parentElement?.removeChild(htmlElement);
}

function deleteNodeRecursive(vdomNode: VDomData, key: string)
{
    if (!vdomNode)
    {
        return;
    }

    removeNode(vdomNode.domNode);
    delete vdomData[key];

    if (vdomNode.vNode.type !== 'text')
    {
        const children = vdomNode.vNode.children;
        for (let i = 0; i < children.length; i++)
        {
            const childKey = createChildKey(children[i], key, i);

            const childVDom = vdomData[childKey];
            deleteNodeRecursive(childVDom, childKey);
        }
    }
}

function createChildKey(child: VirtualElement, parentKey: string, index: number)
{
    let childKey = `${parentKey}_${index}`;
    if (child.type === 'complex')
    {
        childKey += '_' + (child.create.name || 'C');
    }
    return childKey;
}

function nodeChanged(oldNode: VirtualElement, newNode: VirtualElement)
{
    if (!oldNode)
    {
        return false;
    }

    if (oldNode.type !== newNode.type)
    {
        return true;
    }

    if (oldNode.type === 'complex')
    {
        return oldNode.create !== (newNode as VirtualComplexElement).create;
    }

    return (oldNode as VirtualIntrinsicElement).nodeType !== (newNode as VirtualIntrinsicElement).nodeType;
}

// Takes a virtual node and turns it into a DOM node.
function create(parentNode: Node, vNode: VirtualElement, key: string)
{
    const currentVDom = vdomData[key] || null;

    if (nodeChanged(currentVDom?.vNode, vNode))
    {
        deleteNodeRecursive(currentVDom, key);
    }

    let domNode = currentVDom?.domNode;

    if (vNode.type === 'text')
    {
        if (!currentVDom || currentVDom.vNode.type !== vNode.type)
        {
            domNode = document.createTextNode(vNode.text);
            parentNode.appendChild(domNode);
            vdomData[key] = { domNode, vNode }
        }
        else if ((currentVDom.vNode as VirtualTextElement).text !== vNode.text)
        {
            domNode.nodeValue = vNode.text;
            vdomData[key] = { domNode, vNode }
        }
    }
    else if (vNode.type === 'complex')
    {
        create(parentNode, vNode.create(vNode.props), `${key}_${vNode.create.name || 'C'}`);
    }
    else if (vNode.type === 'intrinsic')
    {
        const currentIntrinsicVNode = currentVDom?.vNode as VirtualIntrinsicElement;
        if (!currentVDom || currentIntrinsicVNode.nodeType !== vNode.nodeType)
        {
            if (currentVDom)
            {
                removeNode(currentVDom.domNode);
            }
            domNode = document.createElement(vNode.nodeType);
            parentNode.appendChild(domNode);
            addAttributes(domNode as HTMLElement, vNode.props);
        }
        else
        {
            applyAttributes(currentVDom.domNode as HTMLElement, currentIntrinsicVNode.props, vNode.props);
        }

        vdomData[key] = { domNode, vNode };

        for (let i = 0; i < vNode.children.length; i++)
        {
            const child = vNode.children[i];
            const childKey = `${key}_${i}`;
            create(domNode, child, childKey);
        }

        if (currentIntrinsicVNode && currentIntrinsicVNode.children)
        {
            for (let i = vNode.children.length; i < currentIntrinsicVNode.children.length; i++)
            {
                const child = currentIntrinsicVNode.children[i];
                let childKey = `${key}_${i}`;
                if (child.type === 'complex')
                {
                    childKey += '_' + (child.create.name || 'C');
                }

                const childVDom = vdomData[childKey];
                deleteNodeRecursive(childVDom, childKey);
            }
        }
    }
    else
    {
        console.error('Unknown vNode type!', vNode);
    }
}

// Renders the given virtualNode into the given parent node.
// This will clear the parent node of all its children.
export function render(virtualNode: VirtualElement, parent: HTMLElement)
{
    create(parent, virtualNode, '_root');
}

// Helper function for creating virtual DOM object.
export function vdom(type: VirtualNodeType, props: Props, ...children: VirtualNode[]): VirtualElement
{
    // Handle getting back an array of children. Eg: [[item1, item2]] instead of just [item1, item2].
    const flatten = !!children ? children.reduce((acc: VirtualElement[], val) => acc.concat(processNode(val)), []) : [];

    if (typeof(type) === 'string')
    {
        return { nodeType: type, props, children: flatten, type: 'intrinsic' }
    }

    return { create: type, props, children: flatten, type: 'complex' };
}

function processNode(input: VirtualNode): VirtualElement
{
    if (typeof(input) === 'object')
    {
        return input as VirtualElement;
    }

    return { text: input.toString(), type: 'text' }
}