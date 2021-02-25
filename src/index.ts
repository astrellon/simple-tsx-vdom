//// Types

// The only thing all virtual elements have in common is that they *might* have a key.
export interface IVirtualElement
{
    readonly key?: string;
}

// Interface for container virtual elements.
export interface IVirtualContainerElement extends IVirtualElement
{
    // Children can be text or another object element.
    // We need the text special type otherwise we wouldn't have a way to specify text.
    readonly children: VirtualElement[];
}

// Properties that an intrinsic virtual element should have.
export interface IntrinsicProperties
{
    // Value for most input elements
    readonly value?: string;

    // Checked boolean for inputs
    readonly checked?: boolean;

    // Selected boolean for option elements
    readonly selected?: boolean;
}

// Map of intrinsic attributes
export interface IntrinsicAttributes
{
    readonly [key: string]: string | number | boolean;
}

// Generic properties that are passed to 'props' of Functional and Class components.
export interface ComponentProperties
{
    readonly [key: string]: any;
}

export interface IntrinsicEventListeners
{
    readonly [eventName: string]: Function;
}

export type IntrinsicStyles = Partial<CSSStyleDeclaration>;

export interface VirtualIntrinsicElement extends IVirtualContainerElement
{
    // Properties of the this virtual DOM element.
    readonly properties: IntrinsicProperties;

    // Attributes to be set on an intrinsic element.
    readonly attributes: IntrinsicAttributes;

    // Events to be added on the intrinsic element.
    readonly listeners: IntrinsicEventListeners;

    // Inline styles to be applied on the intrinsic element.
    readonly style: IntrinsicStyles;

    // The name of the node type ('div', 'span', etc)
    readonly nodeName: string;
}

export interface IVirtualComponent extends IVirtualContainerElement
{
    readonly props: ComponentProperties;
}

export interface VirtualFunctionalElement extends IVirtualContainerElement
{
    readonly props: ComponentProperties;

    readonly func: FunctionalComponent;
}

export type ClassComponentConstructor = new () => ClassComponent;
export interface VirtualClassElement extends IVirtualContainerElement
{
    readonly props: ComponentProperties;

    readonly ctor: ClassComponentConstructor;
}

export interface VirtualTextElement
{
    readonly textValue: string;
}

//// Interface for DOM

export interface DomNodeList
{
    readonly length: number;
    item(index: number): DomNode;
}

export interface DomNode
{
    parentElement: DomElement | null;
    nodeType: number;
}
export interface DomText extends DomNode
{
    nodeValue: string | null;
}
export interface DomDocument
{
    createElement: (type: string) => DomElement;
    createElementNS: (namespace: any, type: string) => DomElement;
    createTextNode: (text: string) => DomText;
}
export interface DomInlineStyle
{
    setProperty: (key: string, value: any) => void;
    removeProperty: (key: string) => void;
}
export interface DomElement extends DomNode
{
    setAttribute: (qualifiedName: string, value: string) => void;
    removeAttribute: (qualifiedName: string) => void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    appendChild: (node: any) => any;
    removeChild: (node: any) => any;
    childNodes: DomNodeList;
    style: DomInlineStyle;

    [key: string]: any;
}

//// Internal Diffing Types

interface ObjectDiff
{
    [key: string]: any;
}

export interface DiffResult
{
    readonly remove: ObjectDiff;
    readonly add: ObjectDiff;
}

export interface VDomData
{
    readonly domNode?: DomNode;
    readonly vNode: VirtualElement;
    readonly instance?: ClassComponent;
}
interface VDomDataStore { [vdomKey: string]: VDomData };

//// External Types

// Represents a virtual element of either text, intrinsic, functional or class based.
export type VirtualElement = VirtualFunctionalElement | VirtualIntrinsicElement | VirtualTextElement | VirtualClassElement;

// Our properties/attributes are just a map of string keys to any value at the moment.
export interface Props
{
    readonly [key: string]: any;
}

// Helper type for marking an interface as not being readonly. Should only be used while building an instance.
type Editable<T> =
{
    -readonly [P in keyof T]: T[P];
}

// A child virtual node is anything that a child node could be. Which could be an already created virtual element.
// String and numbers should be turned into text nodes and a boolean should be ignored.
// The boolean part is to support the conditional rendering of an element in TSX, eg: { condition && <div>Condition True</div> }
export type ChildVirtualNode = VirtualElement[] | VirtualElement | string | number | boolean;

// Functional component, creates nodes based on the input.
export type FunctionalComponent<TProps extends Props = Props | any> = (props: TProps, children: VirtualElement[]) => VirtualElement;

// Acceptable types for creating a virtual node, either an intrinsic type, a functional component or the constructor for a class component.
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
            this.vdom.renderDom((vdomNode.domNode as DomNode).parentElement as DomElement, this.render(), this.vdomKey);
        }
    }
}

/**
 * VDom class represents a whole virtual DOM.
 *
 * A virtual DOM is an abstract and importantly light-weight representation of the DOM in the browser.
 * The purpose is to simplify manipulating real DOM elements by creating virtual DOM elements.
 *
 * The VDom is responsible for creating virtual elements from TSX syntax, keeping track of changes to the virtual DOM
 * and creating/manipulating DOM elements based on those changes.
 *
 * The virtual DOM is made up of virtual elements which are simple Javascript objects, for example a header with title would look like this
 *  {
 *      intrinsicType: "h1",
 *      props: {},
 *      children: [
 *          {
 *              text: "Heading Text"
 *          }
 *      ]
 *  }
 *
 * There are four kinds of virtual element types:
 * - Text: Plain text nodes, nearly all text in the DOM is done via a text node.
 * - Intrinsic: Built in supported node types, eg: h1, div, span, input, etc
 * - Functional: An element that is represented by a function where upon executing it, it will return a virtual element.
 * - Class: An element that is represented by a class instance which contains a render method which will return a virtual element.
 */
export class VDom
{
    // Static fields
    static readonly rootKey: string = 'R';

    // Keeps track of the current vdom that will be used by the default exported vdom/render functions.
    static current: VDom;

    // Keeps track of all the virtual DOM information.
    public vdomData: VDomDataStore = {};
    // Namespace stack, keeps track of the current (beyond the empty default) XML namespace to use.
    // This is used for SVG support.
    public nsStack: string[] = [];

    // The document that the virtual dom is apart of.
    public doc: DomDocument;

    // Create the VDom with the given document.
    constructor (doc: DomDocument)
    {
        this.doc = doc;
    }

    // The main render function which turns a virtual element into DOM elements.
    public render(virtualNode: VirtualElement, parent: DomElement)
    {
        this.nsStack = [];
        this.renderDom(parent, virtualNode, VDom.rootKey);
    }

    public hydrate(virtualNode: VirtualElement, parent: HTMLElement)
    {
        this.hydrateDom(parent, virtualNode, VDom.rootKey, 0);
    }

    //// Create virtual DOM elements

    // Main function creating virtual elements. Usually exposed through the `vdom` function.
    public createVDom(nodeType: VirtualNodeType, props: any | undefined = undefined, ...children: ChildVirtualNode[]): VirtualElement
    {
        // Handle getting back an array of children. Eg: [[item1, item2]] instead of just [item1, item2].
        const processedChildren = children.flat(Infinity)
            .filter(child => child != undefined && typeof(child) !== 'boolean')
            .map(this.processChildNode);

        props = props || {};

        if (typeof(nodeType) === 'string')
        {
            return this.createIntrinsicNode(nodeType, props, processedChildren);
        }
        if (nodeType.prototype instanceof ClassComponent)
        {
            return this.createClassNode(nodeType as ClassComponentConstructor, props, processedChildren);
        }
        if (typeof(nodeType) === 'function')
        {
            return this.createFunctionalNode(nodeType as FunctionalComponent, props, processedChildren);
        }

        throw new Error('Unknown virtual node type');
    }

    // Clears the virtual DOM, deleting all created DOM elements along the way.
    public clear()
    {
        this.deleteVDomData(this.vdomData[VDom.rootKey], VDom.rootKey);
        this.vdomData = {};
        this.nsStack = [];
    }

    // Handle child virtual nodes which will either be a virtual element (already gone through createVDom) or is a plain string or number.
    private processChildNode = (input: ChildVirtualNode): VirtualElement =>
    {
        // At this point we should have already checked for undefined, null and boolean,
        // so an object here should be a virtual element, or string or a number.
        if (typeof(input) === 'object')
        {
            return input as VirtualElement;
        }

        return this.createTextNode(input.toString());
    }

    // A very basic text node.
    public createTextNode(textValue: string): VirtualTextElement
    {
        return { textValue }
    }

    // We want to create an intrinsic node so process the props into attributes, events, styles, values and children.
    public createIntrinsicNode(intrinsicType: string, inputProps: Props, children: VirtualElement[]): VirtualIntrinsicElement
    {
        const attributes: Editable<IntrinsicAttributes> = {}
        const eventListeners: Editable<IntrinsicEventListeners> = {};
        const properties: Editable<IntrinsicProperties> = {};
        let style: IntrinsicStyles = {};

        for (const prop in inputProps)
        {
            const propValue = inputProps[prop];
            if (attributeIsEventListener(prop, propValue))
            {
                eventListeners[prop.substr(2)] = propValue;
            }
            else if (attributeIsProperty(prop))
            {
                properties[prop] = propValue;
            }
            else if (prop === 'style')
            {
                style = propValue as IntrinsicStyles;
            }
            else if (prop === 'key')
            {
                // Ignore
            }
            else
            {
                attributes[prop] = propValue;
            }
        }

        return {
            children,
            nodeName: intrinsicType,
            attributes,
            style,
            listeners: eventListeners,
            key: inputProps.key,
            properties
        }
    }

    // Create a class node from a class node constructor with props and children.
    public createClassNode(ctor: ClassComponentConstructor, inputProps: ComponentProperties, children: VirtualElement[]): VirtualClassElement
    {
        const key = inputProps.key;
        inputProps = processComponentProps(inputProps);

        return {
            children,
            ctor,
            props: inputProps,
            key
        }
    }

    // Create a functional node from a function with props and children.
    public createFunctionalNode(renderNode: FunctionalComponent, inputProps: ComponentProperties, children: VirtualElement[]): VirtualFunctionalElement
    {
        const key = inputProps.key;
        inputProps = processComponentProps(inputProps);

        return {
            children,
            func: renderNode,
            props: inputProps,
            key
        }
    }

    //// Processing virtual elements into actual DOM elements.

    // Takes a virtual element and turns it into a DOM node.
    public renderDom(parentNode: DomElement, vNode: VirtualElement, key: string)
    {
        const currentVDom = this.vdomData[key];

        if (this.hasVElementChanged(currentVDom?.vNode, vNode))
        {
            this.deleteVDomData(currentVDom, key);
        }

        if (isTextNode(vNode))
        {
            this.renderTextNode(currentVDom, parentNode, vNode, key);
        }
        else if (isClassNode(vNode))
        {
            this.renderClassNode(currentVDom, parentNode, vNode, key);
        }
        else if (isFunctionalNode(vNode))
        {
            this.renderFunctionalNode(parentNode, vNode, key);
        }
        else if (isIntrinsicNode(vNode))
        {
            this.renderIntrinsicNode(currentVDom, parentNode, vNode, key);
        }
    }

    // Deletes a virtual element along with any created DOM elements.
    public deleteVDomData(vdomNode: VDomData, key: string)
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
                this.deleteVDomData(childVDom, childKey);
            }
        }
        else if (isFunctionalNode(vdomNode.vNode) || isClassNode(vdomNode.vNode))
        {
            const functionalChildKey = createComponentKey(key);
            const functionalChildVDom = this.vdomData[functionalChildKey];
            this.deleteVDomData(functionalChildVDom, functionalChildKey);

            if (isClassNode(vdomNode.vNode))
            {
                (vdomNode.instance as ClassComponent).onUnmount();
            }
        }

        removeDomElement(vdomNode.domNode);
        delete this.vdomData[key];
    }

    // Check if a virtual element has fundamentally changed, either it's not the same type (functional vs class vs intrinsic).
    // Also checks if they're same type of component if the function in the functional component is now a different function or
    // the intrinsic node type is different.
    public hasVElementChanged(oldNode: VirtualElement, newNode: VirtualElement)
    {
        if (!oldNode)
        {
            return false;
        }

        if (isFunctionalNode(oldNode))
        {
            return oldNode.func !== (newNode as VirtualFunctionalElement).func;
        }
        if (isClassNode(oldNode))
        {
            return oldNode.ctor !== (newNode as VirtualClassElement).ctor;
        }
        if (isIntrinsicNode(oldNode))
        {
            return oldNode.nodeName !== (newNode as VirtualIntrinsicElement).nodeName;
        }

        return false;
    }

    // Render a text node, either create it or update the existing one.
    public renderTextNode(currentVDom: VDomData | undefined, parentNode: DomElement, vNode: VirtualTextElement, key: string)
    {
        if (!currentVDom)
        {
            const domNode = this.doc.createTextNode(vNode.textValue);
            parentNode.appendChild(domNode);
            this.vdomData[key] = { domNode, vNode }
        }
        else if ((currentVDom.vNode as VirtualTextElement).textValue !== vNode.textValue)
        {
            (currentVDom.domNode as DomText).nodeValue = vNode.textValue;
            this.vdomData[key] = { domNode: currentVDom.domNode, vNode }
        }
    }

    // Render a functional node.
    public renderFunctionalNode(parentNode: DomElement, vNode: VirtualFunctionalElement, key: string)
    {
        const functionalChildKey = createComponentKey(key);
        this.renderDom(parentNode, vNode.func(vNode.props, vNode.children), functionalChildKey);
        this.vdomData[key] = { vNode }
    }

    // Render a class node, mount it if it's new and checks if the props have changed and ignore further rendering.
    public renderClassNode(currentVDom: VDomData, parentNode: DomElement, vNode: VirtualClassElement, key: string)
    {
        let inst = currentVDom?.instance;
        const isNew = !inst;
        if (!inst)
        {
            inst = new vNode.ctor();
            inst.vdomKey = createComponentKey(key);
            inst.vdom = this;
        }
        else if (!inst.hasChanged(vNode.props))
        {
            return;
        }

        this.renderDom(parentNode, inst.internalRender(vNode.props, vNode.children), inst.vdomKey);
        this.vdomData[key] = { vNode, instance: inst }

        if (isNew)
        {
            inst.onMount();
        }
    }

    // Renders an intrinsic node, either creates or updates it along with attributes, event listeners, inline styles or input properties.
    public renderIntrinsicNode(currentVDom: VDomData, parentNode: DomElement, vNode: VirtualIntrinsicElement, key: string)
    {
        const currentIntrinsicVNode = currentVDom?.vNode as VirtualIntrinsicElement;

        const newXmlNs = vNode.attributes?.xmlns;
        if (newXmlNs)
        {
            this.nsStack.push(newXmlNs as string);
        }

        const newNode = !currentVDom || currentIntrinsicVNode.nodeName !== vNode.nodeName;

        let domNode: DomElement;
        if (newNode)
        {
            if (currentVDom)
            {
                removeDomElement(currentVDom.domNode);
            }

            const stackXmlNs = this.nsStack[this.nsStack.length - 1];
            if (stackXmlNs)
            {
                domNode = this.doc.createElementNS(stackXmlNs, vNode.nodeName);
            }
            else
            {
                domNode = this.doc.createElement(vNode.nodeName);
            }
            parentNode.appendChild(domNode);
        }
        else
        {
            domNode = currentVDom.domNode as DomElement;
        }

        this.vdomData[key] = { domNode, vNode };

        this.renderChildrenNodes(currentIntrinsicVNode, domNode, vNode, key);

        // Add or apply attributes after children are created for select element.
        this.applyAttributes(domNode, currentIntrinsicVNode?.attributes, vNode.attributes);
        this.applyStyle(domNode, currentIntrinsicVNode?.style, vNode.style);
        this.applyEventListeners(domNode, currentIntrinsicVNode?.listeners, vNode.listeners);
        this.applyProperties(domNode, currentIntrinsicVNode?.properties, vNode.properties);

        if (newXmlNs)
        {
            this.nsStack.pop();
        }
    }

    public renderChildrenNodes(currentIntrinsicVNode: VirtualIntrinsicElement | undefined, domNode: DomElement, vNode: VirtualIntrinsicElement, key: string)
    {
        const previousChildren = currentIntrinsicVNode?.children;
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

        const domNodeChildren = domNode.childNodes;
        for (let i = 0; i < vNode.children.length; i++)
        {
            const child = vNode.children[i];
            const childKey = createChildKey(child, key, i);
            this.renderDom(domNode, child, childKey);
            delete keysToRemove[childKey];

            const newVDom = isFunctionalNode(child) || isClassNode(child) ?
                this.vdomData[createComponentKey(childKey)] :
                this.vdomData[childKey];

            if (domNodeChildren.item(i) !== newVDom.domNode)
            {
                newVDom.domNode?.parentElement?.insertBefore(newVDom.domNode, domNodeChildren.item(i));
            }
        }

        for (const childKey in keysToRemove)
        {
            const childVDom = this.vdomData[childKey];
            this.deleteVDomData(childVDom, childKey);
        }
    }

    //// Hydration

    // Hydration is the process of linking up existing elements with the virtual DOM.
    // This allows us to create the DOM somewhere else (like on the server) and then reuse
    // the elements rather than having to blow away the work done by the browser and server.
    // Most important on lower-powered devices. In someways it does mean a larger initial payload because
    // it'll contain the HTML, but it also means that the browser should be able to display the initial payload
    // before the scripts have finished loading/parsing.
    public hydrateDom(parentNode: DomElement, vNode: VirtualElement, key: string, index: number)
    {
        if (isTextNode(vNode))
        {
            this.hydrateTextNode(parentNode, vNode, key, index);
        }
        else if (isClassNode(vNode))
        {
            this.hydrateClassNode(parentNode, vNode, key, index);
        }
        else if (isFunctionalNode(vNode))
        {
            this.hydrateFunctionalNode(parentNode, vNode, key, index);
        }
        else if (isIntrinsicNode(vNode))
        {
            this.hydrateIntrinsicNode(parentNode, vNode, key, index);
        }
    }

    public hydrateTextNode(parentNode: DomElement, vNode: VirtualTextElement, key: string, index: number)
    {
        const domNode = parentNode.childNodes.item(index);
        this.vdomData[key] = { domNode, vNode };
    }

    public hydrateFunctionalNode(parentNode: DomElement, vNode: VirtualFunctionalElement, key: string, index: number)
    {
        const functionalChildKey = createComponentKey(key);
        this.hydrateDom(parentNode, vNode.func(vNode.props, vNode.children), functionalChildKey, index);
        this.vdomData[key] = { vNode }
    }

    public hydrateClassNode(parentNode: DomElement, vNode: VirtualClassElement, key: string, index: number)
    {
        const inst = new vNode.ctor();
        inst.vdomKey = createComponentKey(key);
        inst.vdom = this;

        this.vdomData[key] = { vNode, instance: inst }

        this.hydrateDom(parentNode, inst.internalRender(vNode.props, vNode.children), inst.vdomKey, index);

        inst.onMount();
    }

    public hydrateIntrinsicNode(parentNode: DomElement, vNode: VirtualIntrinsicElement, key: string, index: number)
    {
        const domElement = parentNode.childNodes.item(index) as DomElement;
        this.vdomData[key] = { domNode: domElement, vNode };

        for (let i = 0; i < vNode.children.length; i++)
        {
            while (domElement.childNodes.item(i).nodeType === Node.COMMENT_NODE)
            {
                domElement.removeChild(domElement.childNodes.item(i));
            }

            const child = vNode.children[i];
            const childKey = createChildKey(child, key, i);
            this.hydrateDom(domElement, child, childKey, i);
        }

        this.applyEventListeners(domElement, undefined, vNode.listeners);
        this.applyProperties(domElement, undefined, vNode.properties);
    }

    //// Handling DOM attributes

    public applyAttributes(domElement: DomElement, currentProps: IntrinsicAttributes | undefined, newProps: IntrinsicAttributes | undefined): DiffResult
    {
        const diff = this.diffProps(currentProps, newProps);

        for (const prop in diff.remove)
        {
            domElement.removeAttribute(prop);
        }
        for (const prop in diff.add)
        {
            domElement.setAttribute(prop, diff.add[prop]);
        }

        return diff;
    }

    //// Handle setting inline DOM CSS styles.

    public applyStyle(domElement: DomElement, currentStyle: IntrinsicStyles | undefined, newStyle: IntrinsicStyles | undefined): DiffResult
    {
        const diff = this.diffProps(currentStyle, newStyle);

        for (const prop in diff.remove)
        {
            domElement.style.removeProperty(prop);
        }
        for (const prop in diff.add)
        {
            domElement.style.setProperty(prop, diff.add[prop]);
        }

        return diff;
    }

    //// Handle setting event listeners on DOM elements.

    public applyEventListeners(domElement: DomElement, currentListeners: IntrinsicEventListeners | undefined, newListeners: IntrinsicEventListeners | undefined): DiffResult
    {
        const diff = this.diffProps(currentListeners, newListeners);

        for (const eventType in diff.remove)
        {
            domElement.removeEventListener(eventType, diff.remove[eventType]);
        }
        for (const eventType in diff.add)
        {
            domElement.addEventListener(eventType, diff.add[eventType]);
        }

        return diff;
    }

    //// Handle setting properties on DOM elements.

    public applyProperties(domElement: DomElement, currentProps: IntrinsicProperties | undefined, newProps: IntrinsicProperties | undefined): DiffResult
    {
        const diff = this.diffProps(currentProps, newProps);

        for (const prop in diff.remove)
        {
            domElement[prop] = undefined;
        }
        for (const prop in diff.add)
        {
            domElement[prop] = diff.add[prop];
        }

        return diff;
    }


    // Basic process for checking what has changed between current and new props.
    public diffProps(currentProps: Props | undefined, newProps: Props = {}): DiffResult
    {
        const remove: ObjectDiff = Object.assign({}, currentProps);
        const add: ObjectDiff = {};

        for (const prop in newProps)
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
}

const createChildKey = (child: VirtualElement, parentKey: string, index: number) =>
{
    if (!isTextNode(child))
    {
        const childKey = child.key;
        if (childKey != undefined)
        {
            return `${parentKey}_:${childKey}`;
        }
    }
    return `${parentKey}_${index}`;
}

const createComponentKey = (parentKey: string) =>
{
    return `${parentKey}_C`;
}

const attributeIsEventListener = (attribute: string, value?: string | EventListener | CSSStyleDeclaration): value is EventListener =>
{
    return attribute.startsWith('on') && typeof(value) === 'function';
}

const attributeIsProperty = (attribute: string): attribute is keyof IntrinsicProperties =>
{
    return attribute === 'value' || attribute === 'checked' || attribute === 'selected';
}

const isIntrinsicNode = (vNode: VirtualElement): vNode is VirtualIntrinsicElement =>
{
    return !!(vNode as VirtualIntrinsicElement).nodeName;
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
    return !!(vNode as VirtualFunctionalElement).func;
}

const removeDomElement = (domElement?: DomNode) =>
{
    if (!domElement) return;

    domElement.parentElement?.removeChild(domElement);
}

const processComponentProps = (inputProps: ComponentProperties) =>
{
    if (inputProps.key !== undefined)
    {
        inputProps = {...inputProps};
        delete (inputProps as any)['key'];
    }
    return inputProps;
}

// This is only intended for internal use where the values that are given are never null!
export const shallowEqual = (objA: any, objB: any) =>
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
export function render(virtualNode: VirtualElement, parent: DomElement)
{
    VDom.current.render(virtualNode, parent);
}

// Helper function for creating virtual DOM object.
export function vdom(type: VirtualNodeType, props: any | undefined = undefined, ...children: ChildVirtualNode[]): VirtualElement
{
    return VDom.current.createVDom(type, props, ...children);
}

export function hydrate(virtualNode: VirtualElement, parent: HTMLElement)
{
    VDom.current.hydrate(virtualNode, parent);
}

if (typeof(document) !== 'undefined')
{
    VDom.current = new VDom(document);
}