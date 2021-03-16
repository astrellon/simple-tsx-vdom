import { VDom, VirtualTextElement, VirtualIntrinsicElement, VirtualFunctionalElement, VirtualClassElement, VirtualElement, ClassComponentConstructor, FunctionalComponent, ComponentProperties, VDomData, IntrinsicAttributes, IntrinsicEventListeners, IntrinsicStyles, IntrinsicProperties, DiffResult, Props, DomNode, DomElement } from "../../../src";

export class VDomStats
{
    public attributesRemoved: { [attribute: string]: number } = {};
    public attributesSet: { [attribute: string]: number } = {};
    public styleRemoved: { [style: string]: number } = {};
    public styleSet: { [style: string]: number } = {};
    public eventListenerRemoved: { [eventType: string]: number } = {};
    public eventListenerSet: { [eventType: string]: number } = {};
    public propertiesRemoved: { [prop: string]: number } = {};
    public propertiesSet: { [prop: string]: number } = {};
    public intrinsicNodesCreated: { [nodeType: string]: number } = {};
    public intrinsicNodesRendered: { [nodeType: string]: number } = {};
    public classComponentsCreated: { [classCompName: string]: number } = {};
    public classComponentsRendered: { [classCompName: string]: number } = {};
    public functionalComponentsCreated: { [funcCompName: string]: number } = {};
    public functionalComponentsRendered: { [funcCompName: string]: number } = {};
    public textNodesCreated: number = 0;
    public textNodesRendered: number = 0;
}

function incField(obj: {[key: string]: number}, key: string)
{
    if (obj[key] == undefined)
    {
        obj[key] = 1;
    }
    else
    {
        obj[key]++;
    }
}

function applyChanges(obj: {[key: string]: number}, props: Props)
{
    for (const prop in props)
    {
        incField(obj, prop);
    }
}

export class VDomDebug extends VDom
{
    public stats: VDomStats = new VDomStats();

    public resetStats()
    {
        this.stats = new VDomStats();
    }

    public applyAttributes(htmlElement: HTMLElement, currentProps: IntrinsicAttributes | undefined, newProps: IntrinsicAttributes | undefined): DiffResult
    {
        const diff = super.applyAttributes(htmlElement, currentProps, newProps);
        applyChanges(this.stats.attributesRemoved, diff.remove);
        applyChanges(this.stats.attributesSet, diff.add);
        return diff;
    }

    public applyStyle(htmlElement: HTMLElement, currentStyle: IntrinsicStyles | undefined, newStyle: IntrinsicStyles | undefined): DiffResult
    {
        const diff = super.applyStyle(htmlElement, currentStyle, newStyle);
        applyChanges(this.stats.styleRemoved, diff.remove);
        applyChanges(this.stats.styleSet, diff.add);
        return diff;
    }

    public applyEventListeners(htmlElement: HTMLElement, currentListeners: IntrinsicEventListeners | undefined, newListeners: IntrinsicEventListeners | undefined): DiffResult
    {
        const diff = super.applyEventListeners(htmlElement, currentListeners, newListeners);
        applyChanges(this.stats.eventListenerRemoved, diff.remove);
        applyChanges(this.stats.eventListenerSet, diff.add);
        return diff;
    }

    public applyProperties(htmlElement: HTMLElement, currentProps: IntrinsicProperties | undefined, newProps: IntrinsicProperties | undefined): DiffResult
    {
        const diff = super.applyProperties(htmlElement, currentProps, newProps);
        applyChanges(this.stats.propertiesRemoved, diff.remove);
        applyChanges(this.stats.propertiesSet, diff.add);
        return diff;
    }

    public createTextNode(textValue: string): VirtualTextElement
    {
        this.stats.textNodesCreated++;
        return super.createTextNode(textValue);
    }

    public createIntrinsicNode(intrinsicType: string, inputProps: Props, children: VirtualElement[]): VirtualIntrinsicElement
    {
        incField(this.stats.intrinsicNodesCreated, intrinsicType);
        return super.createIntrinsicNode(intrinsicType, inputProps, children);
    }

    public createClassNode(ctor: ClassComponentConstructor, inputProps: ComponentProperties, children: VirtualElement[]): VirtualClassElement
    {
        incField(this.stats.classComponentsCreated, ctor.name);
        return super.createClassNode(ctor, inputProps, children);
    }

    public createFunctionalNode(renderNode: FunctionalComponent, inputProps: ComponentProperties, children: VirtualElement[]): VirtualFunctionalElement
    {
        incField(this.stats.functionalComponentsCreated, renderNode.name);
        return super.createFunctionalNode(renderNode, inputProps, children);
    }

    public renderTextNode(currentVDom: VDomData | undefined, parentNode: DomElement, vNode: VirtualTextElement, key: string)
    {
        this.stats.textNodesRendered++;
        return super.renderTextNode(currentVDom, parentNode, vNode, key);
    }

    public renderFunctionalNode(parentNode: DomElement, vNode: VirtualFunctionalElement, key: string)
    {
        incField(this.stats.functionalComponentsRendered, vNode.func.name);
        return super.renderFunctionalNode(parentNode, vNode, key);
    }

    public renderClassNode(currentVDom: VDomData, parentNode: DomElement, vNode: VirtualClassElement, key: string)
    {
        incField(this.stats.classComponentsRendered, vNode.ctor.name);
        return super.renderClassNode(currentVDom, parentNode, vNode, key);
    }

    public renderIntrinsicNode(currentVDom: VDomData, parentNode: DomElement, vNode: VirtualIntrinsicElement, key: string)
    {
        incField(this.stats.intrinsicNodesRendered, vNode.nodeName);
        return super.renderIntrinsicNode(currentVDom, parentNode, vNode, key);
    }
}

