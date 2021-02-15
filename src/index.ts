//// Types

// How we want our virtual elements to look like
export interface IVirtualContainerElement
{
    // Properties of the this virtual DOM element.
    readonly props: Props;

    // Children can be text or another object element.
    // We need the text special type otherwise we wouldn't have a way to specify text.
    readonly children: VirtualElement[];
}

export interface VirtualIntrinsicElement extends IVirtualContainerElement
{
    // The name of the node type ('div', 'span', etc)
    readonly intrinsicType: string;
}

export interface VirtualFunctionalElement extends IVirtualContainerElement
{
    readonly renderNode: FunctionalComponent;
}

export type ClassComponentConstructor = new () => ClassComponent;
export interface VirtualClassElement extends IVirtualContainerElement
{
    readonly ctor: ClassComponentConstructor;
}

export interface VirtualTextElement
{
    readonly textValue: string;
}

//// Internal Diffing Types

interface ObjectDiff
{
    [key: string]: any;
}

export interface VDomData
{
    readonly domNode?: Node;
    readonly vNode: VirtualElement;
    readonly classInstance?: ClassComponent;
}
interface VDomDataStore { [vdomKey: string]: VDomData };

//// External Types

// Represents a virtual element of either text, intrinsic, functional or class based.
export type VirtualElement = VirtualFunctionalElement | VirtualIntrinsicElement | VirtualTextElement | VirtualClassElement;

// Our properties/attributes are just a map of string keys to any value at the moment.
export interface Props
{
    readonly key?: string | number;
    readonly [key: string]: any;
}

// A virtual node is either and element above or plain text.
export type VirtualNode = VirtualElement[] | VirtualElement | string | number | boolean;
// Functional component, creates nodes based on the input.
export type FunctionalComponent<TProps extends Props = Props | any> = (props: TProps, children: VirtualElement[]) => VirtualElement;
export type VirtualNodeType = string | FunctionalComponent | ClassComponentConstructor;

export abstract class ClassComponent<TProps extends Props = Props>
{
    public props: TProps = ({} as any);
    public children: VirtualElement[] = [];
    public vdom?: VDom = undefined;
    public vdomKey: string = '';

    public onMount() { }
    public onUnmount() { }
    public hasChanged(newProps: TProps)
    {
        return !shallowEqual(this.props, newProps);
    }
    public abstract render(): VirtualElement;

    public internalRender(props: TProps, children: VirtualElement[]): VirtualElement
    {
        this.props = props;
        this.children = children;

        return this.render();
    }

    public forceUpdate()
    {
        if (!this.vdom)
        {
            return;
        }

        const vdomNode = this.vdom.vdomData[this.vdomKey];
        if (vdomNode)
        {
            this.vdom.createDom((vdomNode.domNode as Node).parentElement as Node, this.render(), this.vdomKey);
        }
    }
}

//// Internal Constants

export class VDom
{
    static rootCounter: number = 0;
    static current: VDom = new VDom();

    public vdomData: VDomDataStore = {};
    public nsStack: string[] = [];

    public isValidAttribute(attribute: string)
    {
        return attribute !== 'key' && attribute !== 'style';
    }

    public setAttribute(htmlElement: HTMLElement, attribute: string, value: string | EventListener)
    {
        // We'll handle style somewhere else
        if (!this.isValidAttribute(attribute))
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

    public removeAttribute(htmlElement: HTMLElement, attribute: string, listener?: EventListener)
    {
        if (!this.isValidAttribute(attribute))
        {
            return;
        }

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

    public diffProps(currentProps: Props, newProps: Props)
    {
        const remove: ObjectDiff = Object.assign({}, currentProps);
        const add: ObjectDiff = {};

        for (const prop in (newProps || {}))
        {
            const currentValue = remove[prop];
            const newValue = newProps[prop];
            if (currentValue != undefined && currentValue === newValue)
            {
                delete remove[prop];
            }
            else
            {
                add[prop] = newValue;
            }
        }

        return { remove, add }
    }

    public applyAttributes(htmlElement: HTMLElement, currentProps: Props, newProps: Props)
    {
        const { remove, add } = this.diffProps(currentProps, newProps);

        for (const prop in remove)
        {
            this.removeAttribute(htmlElement, prop, remove[prop]);
        }
        for (const prop in add)
        {
            this.setAttribute(htmlElement, prop, add[prop]);
        }
    }

    public applyStyle(htmlElement: HTMLElement, currentStyle: CSSStyleDeclaration, newStyle: CSSStyleDeclaration)
    {
        const { remove, add } = this.diffProps(currentStyle, newStyle);

        for (const prop in remove)
        {
            this.removeStyle(htmlElement, prop);
        }
        for (const prop in add)
        {
            this.setStyle(htmlElement, prop, add[prop]);
        }
    }

    public removeStyle(htmlElement: HTMLElement, prop: string)
    {
        (htmlElement.style as any)[prop] = undefined;
    }
    public setStyle(htmlElement: HTMLElement, prop: string, value: any)
    {
        (htmlElement.style as any)[prop] = value;
    }

    public deleteVDomDataRecursive(vdomNode: VDomData, key: string)
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
                const childVDom = this.vdomData[childKey];
                this.deleteVDomDataRecursive(childVDom, childKey);
            }
        }
        else if (isFunctionalNode(vdomNode.vNode) || isClassNode(vdomNode.vNode))
        {
            const functionalChildKey = createComplexKey(key);
            const functionalChildVDom = this.vdomData[functionalChildKey];
            this.deleteVDomDataRecursive(functionalChildVDom, functionalChildKey);

            if (isClassNode(vdomNode.vNode))
            {
                (vdomNode.classInstance as ClassComponent).onUnmount();
            }
        }

        removeHtmlNode(vdomNode.domNode);
        delete this.vdomData[key];
    }

    public hasVElementChanged(oldNode: VirtualElement, newNode: VirtualElement)
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

    public createTextNode(currentVDom: VDomData | undefined, parentNode: Node, vNode: VirtualTextElement, key: string)
    {
        if (!currentVDom)
        {
            const domNode = document.createTextNode(vNode.textValue);
            parentNode.appendChild(domNode);
            this.vdomData[key] = { domNode, vNode }
        }
        else if ((currentVDom.vNode as VirtualTextElement).textValue !== vNode.textValue)
        {
            (currentVDom.domNode as Node).nodeValue = vNode.textValue;
            this.vdomData[key] = { domNode: currentVDom.domNode, vNode }
        }
    }

    public createFunctionalNode(parentNode: Node, vNode: VirtualFunctionalElement, key: string)
    {
        const functionalChildKey = createComplexKey(key);
        this.createDom(parentNode, vNode.renderNode(vNode.props, vNode.children), functionalChildKey);
        this.vdomData[key] = { vNode }
    }

    public createClassNode(currentVDom: VDomData, parentNode: Node, vNode: VirtualClassElement, key: string)
    {
        let inst = currentVDom?.classInstance;
        const isNew = !inst;
        if (!inst)
        {
            inst = new vNode.ctor();
            inst.vdomKey = createComplexKey(key);
            inst.vdom = this;
        }
        else if (!inst.hasChanged(vNode.props))
        {
            return;
        }

        this.createDom(parentNode, inst.internalRender(vNode.props, vNode.children), inst.vdomKey);
        this.vdomData[key] = { vNode, classInstance: inst }

        if (isNew)
        {
            inst.onMount();
        }
    }

    public createIntrinsicNode(currentVDom: VDomData, parentNode: Node, vNode: VirtualIntrinsicElement, key: string)
    {
        const currentIntrinsicVNode = currentVDom?.vNode as VirtualIntrinsicElement;
        const previousChildren = currentIntrinsicVNode?.children;

        const newXmlNs = vNode.props.xmlns;
        if (newXmlNs)
        {
            this.nsStack.push(newXmlNs);
        }

        const newNode = !currentVDom || currentIntrinsicVNode.intrinsicType !== vNode.intrinsicType;

        let domNode: Node;
        if (newNode)
        {
            if (currentVDom)
            {
                removeHtmlNode(currentVDom.domNode);
            }

            const stackXmlNs = this.nsStack[this.nsStack.length - 1];
            if (stackXmlNs)
            {
                domNode = document.createElementNS(stackXmlNs, vNode.intrinsicType);
            }
            else
            {
                domNode = document.createElement(vNode.intrinsicType);
            }
            parentNode.appendChild(domNode);
        }
        else
        {
            domNode = currentVDom.domNode as Node;
        }

        this.vdomData[key] = { domNode, vNode };
        const keysToRemove: { [key: string]: VirtualElement } = {};
        const previousVNodes: VDomData[] = [];

        if (previousChildren)
        {
            for (let i = 0; i < previousChildren.length; i++)
            {
                const child = previousChildren[i];
                const childKey = createChildKey(child, key, i);
                keysToRemove[childKey] = child;
                previousVNodes[i] = this.vdomData[childKey];
            }
        }

        const domNodeChildren = domNode.childNodes as NodeListOf<ChildNode>;
        for (let i = 0; i < vNode.children.length; i++)
        {
            const child = vNode.children[i];
            const childKey = createChildKey(child, key, i);
            this.createDom(domNode, child, childKey);
            delete keysToRemove[childKey];

            const newVDom = isFunctionalNode(child) || isClassNode(child) ?
                this.vdomData[createComplexKey(childKey)] :
                this.vdomData[childKey];

            if (domNodeChildren[i] !== newVDom.domNode)
            {
                newVDom.domNode?.parentNode?.insertBefore(newVDom.domNode, domNodeChildren[i]);
            }
        }

        for (const childKey in keysToRemove)
        {
            const childVDom = this.vdomData[childKey];
            this.deleteVDomDataRecursive(childVDom, childKey);
        }

        // Add or apply attributes after children are created for select element.
        this.applyAttributes(domNode as HTMLElement, currentIntrinsicVNode?.props, vNode.props);
        this.applyStyle(domNode as HTMLElement, currentIntrinsicVNode?.props.style, vNode.props.style);

        if (newXmlNs)
        {
            this.nsStack.pop();
        }
    }

    // Takes a virtual node and turns it into a DOM node.
    public createDom(parentNode: Node, vNode: VirtualElement, key: string)
    {
        const currentVDom = this.vdomData[key];

        if (this.hasVElementChanged(currentVDom?.vNode, vNode))
        {
            this.deleteVDomDataRecursive(currentVDom, key);
        }

        if (isTextNode(vNode))
        {
            this.createTextNode(currentVDom, parentNode, vNode, key);
        }
        else if (isClassNode(vNode))
        {
            this.createClassNode(currentVDom, parentNode, vNode, key);
        }
        else if (isFunctionalNode(vNode))
        {
            this.createFunctionalNode(parentNode, vNode, key);
        }
        else if (isIntrinsicNode(vNode))
        {
            this.createIntrinsicNode(currentVDom, parentNode, vNode, key);
        }
    }

    public processNode(input: VirtualNode): VirtualElement
    {
        if (typeof(input) === 'object')
        {
            return input as VirtualElement;
        }

        return { textValue: input.toString() }
    }

    public render(virtualNode: VirtualElement, parent: HTMLElement)
    {
        this.nsStack = [];
        let rootKey = (parent as any).vdomKey;
        if (!rootKey)
        {
            rootKey = `_R${++VDom.rootCounter}`;
            (parent as any).vdomKey = rootKey;
        }
        this.createDom(parent, virtualNode, rootKey);
    }

    // Helper function for creating virtual DOM object.
    public createVDom(type: VirtualNodeType, props: any | undefined = undefined, ...children: VirtualNode[]): VirtualElement
    {
        // Handle getting back an array of children. Eg: [[item1, item2]] instead of just [item1, item2].
        const flatten = children.flat(Infinity)
            .filter(child => child != undefined && child !== false)
            .map(this.processNode);

        props = props || {};

        if (typeof(type) === 'string')
        {
            return { intrinsicType: type, props, children: flatten }
        }
        if (type.prototype instanceof ClassComponent)
        {
            return { ctor: type as ClassComponentConstructor, children: flatten, props }
        }

        return { renderNode: type as FunctionalComponent, props, children: flatten };
    }
}

const createChildKey = (child: VirtualElement, parentKey: string, index: number) =>
{
    if (!isTextNode(child))
    {
        const childKey = child.props.key;
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

const attributeIsEventListener = (attribute: string, value?: string | EventListener | CSSStyleDeclaration): value is EventListener =>
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

// This is only intended for internal use where the values that are given are never null!
export function shallowEqual(objA: any, objB: any)
{
    if (objA === objB)
    {
        return true;
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
    VDom.current.render(virtualNode, parent);
}

// Helper function for creating virtual DOM object.
export function vdom(type: VirtualNodeType, props: any | undefined = undefined, ...children: VirtualNode[]): VirtualElement
{
    return VDom.current.createVDom(type, props, ...children);
}