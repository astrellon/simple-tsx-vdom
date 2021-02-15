import { VDom, VirtualTextElement, VirtualIntrinsicElement, VirtualFunctionalElement, VirtualClassElement, VDomData } from "../../../src";

export class VDomStats
{
    public attributesSet: number = 0;
    public attributesRemoved: number = 0;
    public stylesSet: number = 0;
    public stylesRemoved: number = 0;
    public intrinsicNodesCalled: { [nodeType: string]: number } = {};
    public classComponentsCalled: { [classCompName: string]: number } = {};
    public functionalComponentsCalled: { [funcCompName: string]: number } = {};
    public textNodesCalled: number = 0;
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

export class VDomDebug extends VDom
{
    public stats: VDomStats = new VDomStats();

    public resetStats()
    {
        this.stats = new VDomStats();
    }

    public setAttribute(htmlElement: HTMLElement, attribute: string, value: string | EventListener)
    {
        if (!this.isValidAttribute(attribute))
        {
            return;
        }

        super.setAttribute(htmlElement, attribute, value);
        this.stats.attributesSet++;
    }

    public removeAttribute(htmlElement: HTMLElement, attribute: string, listener?: EventListener)
    {
        if (!this.isValidAttribute(attribute))
        {
            return;
        }

        super.removeAttribute(htmlElement, attribute, listener);
        this.stats.attributesRemoved++;
    }

    public createIntrinsicNode(currentVDom: VDomData, parentNode: Node, vNode: VirtualIntrinsicElement, key: string)
    {
        super.createIntrinsicNode(currentVDom, parentNode, vNode, key);
        incField(this.stats.intrinsicNodesCalled, vNode.intrinsicType);
    }

    public createFunctionalNode(parentNode: Node, vNode: VirtualFunctionalElement, key: string)
    {
        super.createFunctionalNode(parentNode, vNode, key);
        incField(this.stats.functionalComponentsCalled, vNode.renderNode.name);
    }

    public createClassNode(currentVDom: VDomData, parentNode: Node, vNode: VirtualClassElement, key: string)
    {
        super.createClassNode(currentVDom, parentNode, vNode, key);
        incField(this.stats.classComponentsCalled, vNode.ctor.name);
    }

    public createTextNode(currentVDom: VDomData | undefined, parentNode: Node, vNode: VirtualTextElement, key: string)
    {
        super.createTextNode(currentVDom, parentNode, vNode, key);
        this.stats.textNodesCalled++;
    }

    public removeStyle(htmlElement: HTMLElement, prop: string)
    {
        super.removeStyle(htmlElement, prop);
        this.stats.stylesRemoved++;
    }
    public setStyle(htmlElement: HTMLElement, prop: string, value: any)
    {
        super.setStyle(htmlElement, prop, value);
        this.stats.stylesSet++;
    }
}

