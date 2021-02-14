//// Types

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
    // The name of the node type ('div', 'span', etc)
    readonly intrinsicType: string;
}

interface VirtualFunctionalElement extends IVirtualContainerElement
{
    readonly renderNode: RenderNode;
}

type VDomComponentConstructor = new () => VDomComponent;
interface VirtualClassElement extends IVirtualContainerElement
{
    readonly ctor: VDomComponentConstructor;
}

interface VirtualTextElement
{
    readonly textValue: string;
}

//// Internal Diffing Types

interface AttributeDiff
{
    readonly attribute: string;
    readonly value: any;
}
interface AttributeDiffs
{
    [key: string]: AttributeDiff;
}

interface VDomData
{
    readonly domNode?: Node;
    readonly vNode: VirtualElement;
    readonly classInstance?: VDomComponent;
}
interface VDomDataStore { [vdomKey: string]: VDomData };

//// External Types

export type VirtualElement = VirtualFunctionalElement | VirtualIntrinsicElement | VirtualTextElement | VirtualClassElement;

// Our properties/attributes are just a map of string keys to any value at the moment.
export interface Props
{
    readonly key?: string | number;
    readonly [key: string]: any;
}

// A virtual node is either and element above or plain text.
export type VirtualNode = VirtualElement[] | VirtualElement | string | number | boolean;
export type RenderNode<TProps extends Props = Props | any> = (props: TProps, children: VirtualElement[]) => VirtualElement;
export type VirtualNodeType = string | RenderNode | VDomComponentConstructor;

export abstract class VDomComponent<TProps extends Props = Props>
{
    public props: TProps = ({} as any);
    public children: VirtualElement[] = [];
    public vdomKey: string = '';

    public onMount() { }
    public onUnmount() { }
    public abstract render(): VirtualElement;

    public internalRender(props: TProps, children: VirtualElement[]): VirtualElement
    {
        this.props = props;
        this.children = children;

        return this.render();
    }

    public forceUpdate()
    {
        const vdomNode = vdomData[this.vdomKey];
        if (vdomNode && vdomNode.domNode?.parentElement)
        {
            create(vdomNode.domNode?.parentElement, this.render(), this.vdomKey);
        }
    }
}

//// Internal Constants

const vdomData: VDomDataStore = { }
let rootCounter: number = 0;
let nsStack: string[] = [];

const createChildKey = (child: VirtualElement, parentKey: string, index: number) =>
{
    if (!isTextNode(child))
    {
        const childKey = child.props?.key;
        if (childKey != undefined)
        {
            return `${parentKey}_${childKey}`;
        }
    }
    return `${parentKey}_${index}`;
}

const createComplexKey = (parentKey: string) =>
{
    return `${parentKey}_C`;
}

const attributeIsEventListener = (attribute: string, value?: string | EventListener): value is EventListener =>
{
    return attribute.startsWith('on') && typeof(value) === 'function';
}

const isIntrinsicNode = (vNode: VirtualElement): vNode is VirtualIntrinsicElement =>
{
    return !!(vNode as VirtualIntrinsicElement).intrinsicType;
}

const isClassNode = (vNode: VirtualElement): vNode is VirtualClassElement =>
{
    return !!(vNode as VirtualClassElement).ctor;
}

const isTextNode = (vNode: VirtualElement): vNode is VirtualTextElement =>
{
    return !!(vNode as VirtualTextElement).textValue;
}

const isFunctionalNode = (vNode: VirtualElement): vNode is VirtualFunctionalElement =>
{
    return !!(vNode as VirtualFunctionalElement).renderNode;
}

const removeHtmlNode = (htmlElement?: Node) =>
{
    if (!htmlElement) return;

    htmlElement.parentElement?.removeChild(htmlElement);
}

const addAttributes = (htmlElement: HTMLElement, props: Props) =>
{
    for (const prop in props)
    {
        addAttribute(htmlElement, prop, props[prop]);
    }
}

function addAttribute(htmlElement: HTMLElement, attribute: string, value: string | EventListener)
{
    if (attribute === 'key')
    {
        return;
    }

    // Check if the string starts with the letters 'on'.
    // Note this function is not available in Internet Explorer.
    if (attributeIsEventListener(attribute, value))
    {
        // Chop off the first two characters and use the rest as the event listener type.
        // Note: This is *not* the correct way to do this.
        // It'll pick on anything that starts with 'on', like 'onion' or 'once'.
        // Also we're not checking if the value is actually a function.
        // For now to get a working example UI we'll go with it.
        htmlElement.addEventListener(attribute.substr(2), value);
    }
    else if (attribute === 'value' || attribute === 'selected' || attribute === 'checked')
    {
        (htmlElement as any)[attribute] = value;
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
    if (attributeIsEventListener(attribute, listener))
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
        removeAttribute(htmlElement, prop, removeAttrs[prop].value);
    }
    for (const prop in addAttrs)
    {
        addAttribute(htmlElement, prop, addAttrs[prop].value);
    }
}

function deleteVDomDataRecursive(vdomNode: VDomData, key: string)
{
    if (!vdomNode)
    {
        return;
    }

    if (isIntrinsicNode(vdomNode.vNode))
    {
        const children = vdomNode.vNode.children;
        for (let i = 0; i < children.length; i++)
        {
            const childKey = createChildKey(children[i], key, i);
            const childVDom = vdomData[childKey];
            deleteVDomDataRecursive(childVDom, childKey);
        }
    }
    else if (isFunctionalNode(vdomNode.vNode) || isClassNode(vdomNode.vNode))
    {
        const functionalChildKey = createComplexKey(key);
        const functionalChildVDom = vdomData[functionalChildKey];
        deleteVDomDataRecursive(functionalChildVDom, functionalChildKey);

        if (isClassNode(vdomNode.vNode))
        {
            vdomNode.classInstance?.onUnmount();
        }
    }

    removeHtmlNode(vdomNode.domNode);
    delete vdomData[key];
}

function hasVElementChanged(oldNode: VirtualElement, newNode: VirtualElement)
{
    if (!oldNode)
    {
        return false;
    }

    if (isFunctionalNode(oldNode))
    {
        return oldNode.renderNode !== (newNode as VirtualFunctionalElement).renderNode;
    }
    if (isClassNode(oldNode))
    {
        return oldNode.ctor !== (newNode as VirtualClassElement).ctor;
    }
    if (isIntrinsicNode(oldNode))
    {
        return oldNode.intrinsicType !== (newNode as VirtualIntrinsicElement).intrinsicType;
    }

    return false;
}

function createTextNode(currentVDom: VDomData | undefined, parentNode: Node, vNode: VirtualTextElement, key: string)
{
    if (!currentVDom)
    {
        const domNode = document.createTextNode(vNode.textValue);
        parentNode.appendChild(domNode);
        vdomData[key] = { domNode, vNode }
    }
    else if ((currentVDom.vNode as VirtualTextElement).textValue !== vNode.textValue)
    {
        (currentVDom.domNode as Node).nodeValue = vNode.textValue;
        vdomData[key] = { domNode: currentVDom.domNode, vNode }
    }
}

function createFunctionalNode(parentNode: Node, vNode: VirtualFunctionalElement, key: string)
{
    const functionalChildKey = createComplexKey(key);
    create(parentNode, vNode.renderNode(vNode.props, vNode.children), functionalChildKey);
    vdomData[key] = { vNode }
}

function createClassNode(currentVDom: VDomData, parentNode: Node, vNode: VirtualClassElement, key: string)
{
    if (currentVDom?.vNode && shallowEqual((currentVDom.vNode as VirtualClassElement).props, vNode.props))
    {
        return;
    }

    let inst = currentVDom?.classInstance;
    const isNew = !inst;
    if (!inst)
    {
        inst = new vNode.ctor();
        inst.vdomKey = createComplexKey(key);
    }
    create(parentNode, inst.internalRender(vNode.props, vNode.children), inst.vdomKey);
    vdomData[key] = { vNode, classInstance: inst }

    if (isNew)
    {
        inst.onMount();
    }
}

function createIntrinsicNode(currentVDom: VDomData, parentNode: Node, vNode: VirtualIntrinsicElement, key: string)
{
    const currentIntrinsicVNode = currentVDom?.vNode as VirtualIntrinsicElement;
    const previousChildren = currentIntrinsicVNode?.children;
    let domNode = currentVDom?.domNode;

    const newXmlNs = vNode.props.xmlns;
    if (newXmlNs)
    {
        nsStack.push(newXmlNs);
    }

    if (!currentVDom || currentIntrinsicVNode.intrinsicType !== vNode.intrinsicType)
    {
        if (currentVDom)
        {
            removeHtmlNode(currentVDom.domNode);
        }

        const stackXmlNs = nsStack[nsStack.length - 1];
        if (stackXmlNs)
        {
            domNode = document.createElementNS(stackXmlNs, vNode.intrinsicType);
        }
        else
        {
            domNode = document.createElement(vNode.intrinsicType);
        }
        parentNode.appendChild(domNode);
        addAttributes(domNode as HTMLElement, vNode.props);
    }
    else
    {
        applyAttributes(currentVDom.domNode as HTMLElement, currentIntrinsicVNode.props, vNode.props);
    }

    vdomData[key] = { domNode, vNode };
    const keysToRemove: { [key: string]: VirtualElement } = {};
    const previousVNodes: VDomData[] = [];

    if (previousChildren)
    {
        for (let i = 0; i < previousChildren.length; i++)
        {
            const child = previousChildren[i];
            const childKey = createChildKey(child, key, i);
            keysToRemove[childKey] = child;
            previousVNodes[i] = vdomData[childKey];
        }
    }

    const domNodeChildren = domNode?.childNodes as NodeListOf<ChildNode>;
    for (let i = 0; i < vNode.children.length; i++)
    {
        const child = vNode.children[i];
        const childKey = createChildKey(child, key, i);
        create(domNode as Node, child, childKey);
        delete keysToRemove[childKey];

        const newVDom = isFunctionalNode(child) || isClassNode(child) ?
            vdomData[createComplexKey(childKey)] :
            vdomData[childKey];

        if (domNodeChildren[i] !== newVDom.domNode)
        {
            newVDom.domNode?.parentNode?.insertBefore(newVDom.domNode, domNodeChildren[i]);
        }
    }

    for (const childKey in keysToRemove)
    {
        const childVDom = vdomData[childKey];
        deleteVDomDataRecursive(childVDom, childKey);
    }

    if (newXmlNs)
    {
        nsStack.pop();
    }
}

// Takes a virtual node and turns it into a DOM node.
function create(parentNode: Node, vNode: VirtualElement, key: string)
{
    if (isFunctionalNode(vNode))
    {
        createFunctionalNode(parentNode, vNode, key);
        return;
    }

    const currentVDom = vdomData[key];

    if (hasVElementChanged(currentVDom?.vNode, vNode))
    {
        deleteVDomDataRecursive(currentVDom, key);
    }

    if (isTextNode(vNode))
    {
        createTextNode(currentVDom, parentNode, vNode, key);
    }
    else if (isClassNode(vNode))
    {
        createClassNode(currentVDom, parentNode, vNode, key);
    }
    else if (isIntrinsicNode(vNode))
    {
        createIntrinsicNode(currentVDom, parentNode, vNode, key);
    }
}

function processNode(input: VirtualNode): VirtualElement
{
    if (typeof(input) === 'object')
    {
        return input as VirtualElement;
    }

    return { textValue: input.toString() }
}

function shallowEqual(objA: any, objB: any)
{
    if (objA === objB)
    {
        return true;
    }

    if (objA === null || objB === null)
    {
        return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length)
    {
        return false;
    }

    // Test for A's keys different from B.
    for (let i = 0; i < keysA.length; i++)
    {
        if (objA[keysA[i]] !== objB[keysA[i]])
        {
            return false;
        }
    }

    return true;
}

// Renders the given virtualNode into the given parent node.
// This will clear the parent node of all its children.
export function render(virtualNode: VirtualElement, parent: HTMLElement)
{
    nsStack = [];
    let rootKey = (parent as any).vdomKey;
    if (!rootKey)
    {
        rootKey = `_R${++rootCounter}`;
        (parent as any).vdomKey = rootKey;
    }
    create(parent, virtualNode, rootKey);
}

// Helper function for creating virtual DOM object.
export function vdom(type: VirtualNodeType, props: any | undefined = undefined, ...children: VirtualNode[]): VirtualElement
{
    // Handle getting back an array of children. Eg: [[item1, item2]] instead of just [item1, item2].
    const flatten = !!children ? children.flat(Infinity)
        .filter(child => !!child)
        .map(processNode) : [];

    props = props || {};

    if (typeof(type) === 'string')
    {
        return { intrinsicType: type, props, children: flatten }
    }
    if (type.prototype instanceof VDomComponent)
    {
        return { ctor: type as VDomComponentConstructor, children: flatten, props }
    }

    return { renderNode: type as RenderNode, props, children: flatten };
}