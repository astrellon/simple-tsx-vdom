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

interface VirtualFunctionalElement extends IVirtualContainerElement
{
    type: 'functional';

    readonly render: RenderNode;
}

type VDomComponentConstructor = new () => VDomComponent;
interface VirtualClassElement extends IVirtualContainerElement
{
    type: 'class';

    readonly ctor: VDomComponentConstructor;
}

export abstract class VDomComponent<TProps extends Props = Props>
{
    public props: TProps = ({} as any);

    public componentDidMount() { }
    public componentWillUnmount() { }
    public abstract render(): VirtualElement;

    public internalRender(props: TProps): VirtualElement
    {
        this.props = props;
        return this.render();
    }
}

interface VirtualTextElement
{
    type: 'text';

    readonly text: string;
}

type VirtualElement = VirtualFunctionalElement | VirtualIntrinsicElement | VirtualTextElement | VirtualClassElement;

// Our properties/attributes are just a map of string keys to any value at the moment.
interface Props
{
    readonly key?: string | number;
    readonly [key: string]: any;
}

interface AttributeDiff
{
    readonly attribute: string;
    readonly value: any;
}
interface AttributeDiffs
{
    [key: string]: AttributeDiff;
}

// A virtual node is either and element above or plain text.
export type VirtualNode = VirtualElement | string | number | boolean;
export type RenderNode<TProps extends Props = Props> = (props: TProps) => VirtualElement;
export type VirtualNodeType = string | RenderNode | VDomComponentConstructor;

interface VDomData
{
    readonly domNode?: Node;
    readonly vNode: VirtualElement;
    readonly classInstance?: VDomComponent;
}
interface VDomDataStore { [vdomKey: string]: VDomData };

const vdomData: VDomDataStore = { }
const EmptyArray: any[] = [];

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
    const removeAttrs: AttributeDiffs = {};
    const addAttrs: AttributeDiffs = {};

    for (const prop in currentProps)
    {
        const currentProp = currentProps[prop];
        removeAttrs[prop] = {
            attribute: prop,
            value: currentProp
        }
    }

    for (const prop in newProps)
    {
        const currentAttr = removeAttrs[prop];
        const newProp = newProps[prop];
        if (currentAttr && currentAttr.value === newProp)
        {
            delete removeAttrs[prop];
            continue;
        }

        addAttrs[prop] = {
            attribute: prop,
            value: newProp
        }
    }

    for (const prop in removeAttrs)
    {
        const attr = removeAttrs[prop];
        removeAttribute(htmlElement, prop, attr.value);
    }
    for (const prop in addAttrs)
    {
        const attr = addAttrs[prop];
        addAttribute(htmlElement, prop, attr.value);
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

    if (vdomNode.vNode.type === 'intrinsic')
    {
        const children = vdomNode.vNode.children;
        for (let i = 0; i < children.length; i++)
        {
            const childKey = createChildKey(children[i], key, i);
            const childVDom = vdomData[childKey];
            deleteNodeRecursive(childVDom, childKey);
        }
    }
    else if (vdomNode.vNode.type === 'functional')
    {
        const functionalChildKey = createFunctionalKey(key);
        const functionalChildVDom = vdomData[functionalChildKey];
        deleteNodeRecursive(functionalChildVDom, functionalChildKey);
    }
    else if (vdomNode.vNode.type === 'class')
    {
        const classChildKey = createClassKey(key);
        const classChildVDom = vdomData[classChildKey];
        deleteNodeRecursive(classChildVDom, classChildKey);

        vdomNode.classInstance?.componentWillUnmount();
    }

    removeNode(vdomNode.domNode);
    delete vdomData[key];
}

function createChildKey(child: VirtualElement, parentKey: string, index: number)
{
    if (child.type !== 'text')
    {
        const childKey = child.props?.key;
        if (childKey != undefined)
        {
            return `${parentKey}_${childKey}`;
        }
    }
    return `${parentKey}_${index}`;
}

function createFunctionalKey(parentKey: string)
{
    return `${parentKey}_FUNC`;
}

function createClassKey(parentKey: string)
{
    return `${parentKey}_CLASS`;
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

    if (oldNode.type === 'functional')
    {
        return oldNode.render !== (newNode as VirtualFunctionalElement).render;
    }
    if (oldNode.type === 'class')
    {
        return oldNode.ctor !== (newNode as VirtualClassElement).ctor;
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
            (domNode as Node).nodeValue = vNode.text;
            vdomData[key] = { domNode, vNode }
        }
    }
    else if (vNode.type === 'functional')
    {
        const functionalChildKey = createFunctionalKey(key);
        create(parentNode, vNode.render(vNode.props), functionalChildKey);
        vdomData[key] = { vNode }
    }
    else if (vNode.type === 'class')
    {
        const classChildKey = createClassKey(key);
        let inst = currentVDom?.classInstance;
        const isNew = !inst;
        if (!inst)
        {
            inst = new vNode.ctor();
        }
        create(parentNode, inst.internalRender(vNode.props), classChildKey);
        vdomData[key] = { vNode, classInstance: inst }

        if (isNew)
        {
            inst.componentDidMount();
        }
    }
    else if (vNode.type === 'intrinsic')
    {
        const currentIntrinsicVNode = currentVDom?.vNode as VirtualIntrinsicElement;
        const previousChildren = currentIntrinsicVNode?.children || EmptyArray;

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
        const keysToRemove: {[key: string]: VirtualElement} = {};
        const previousVNodes: VDomData[] = [];

        for (let i = 0; i < previousChildren.length; i++)
        {
            const child = previousChildren[i];
            const childKey = createChildKey(child, key, i);
            keysToRemove[childKey] = child;
            previousVNodes[i] = vdomData[childKey];
        }

        const domNodeChildren = domNode?.childNodes as NodeListOf<ChildNode>;
        for (let i = 0; i < vNode.children.length; i++)
        {
            const child = vNode.children[i];
            const childKey = createChildKey(child, key, i);
            create(domNode as Node, child, childKey);
            delete keysToRemove[childKey];

            const newVDom = child.type === 'functional' ? vdomData[createFunctionalKey(childKey)] : vdomData[childKey];
            if (domNodeChildren[i] !== newVDom.domNode)
            {
                newVDom.domNode?.parentNode?.insertBefore(newVDom.domNode, domNodeChildren[i]);
            }
        }

        for (const childKey in keysToRemove)
        {
            const childVDom = vdomData[childKey];
            deleteNodeRecursive(childVDom, childKey);
        }
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
    const flatten = !!children ? children.reduce((acc: VirtualElement[], val) =>
    {
        if (val == undefined || val === false)
        {
            return acc;
        }
        return acc.concat(processNode(val))
    }, []) : [];

    if (typeof(type) === 'string')
    {
        return { nodeType: type, props, children: flatten, type: 'intrinsic' }
    }
    if (type.prototype instanceof VDomComponent)
    {
        return { ctor: type as VDomComponentConstructor, children: flatten, type: 'class', props }
    }

    return { render: type as RenderNode, props, children: flatten, type: 'functional' };
}

function processNode(input: VirtualNode): VirtualElement
{
    if (typeof(input) === 'object')
    {
        return input as VirtualElement;
    }

    return { text: input.toString(), type: 'text' }
}