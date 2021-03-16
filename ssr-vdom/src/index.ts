import { DomElement, DomNodeList, DomNode, DomText, DomInlineStyle, DomDocument, DomClassList } from 'simple-tsx-vdom';

function quoteattr(s: string, preserveCR?: string)
{
    preserveCR = preserveCR ? '&#13;' : '\n';
    return ('' + s) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        /*
        You may add other replacements here for HTML only
        (but it's not necessary).
        Or for XML, only if the named entities are defined in its DTD.
        */
        .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, preserveCR);
    ;
}

export class SSRDomNodeList implements DomNodeList
{
    public get length()
    {
        return this.nodes.length;
    }

    public nodes: DomNode[] = [];

    public item(index: number): DomNode
    {
        return this.nodes[index];
    }
}

export abstract class SSRDomNode implements DomNode
{
    public parentElement: DomElement | null = null;

    public nodeType: number = 0;

    public abstract toString(forHydration: boolean, parentNode?: SSRDomNode, previousNode?: SSRDomNode): string;

    public hydrateToString(parentNode?: SSRDomNode, previousNode?: SSRDomNode)
    {
        return this.toString(true, parentNode, previousNode);
    }

    public renderToString(parentNode?: SSRDomNode, previousNode?: SSRDomNode)
    {
        return this.toString(false, parentNode, previousNode);
    }
}

export class SSRDomText extends SSRDomNode implements DomText
{
    public nodeValue: string;

    constructor (nodeValue: string)
    {
        super();
        this.nodeValue = nodeValue;
    }

    public toString(forHydration: boolean, parentNode?: SSRDomNode, previousNode?: SSRDomNode)
    {
        if (forHydration && previousNode instanceof SSRDomText)
        {
            return '<!-- -->' + this.nodeValue;
        }
        return this.nodeValue;
    }
}

interface InlineStyle
{
    [key: string]: any;
}

export class SSRDomInlineStyle implements DomInlineStyle
{
    public values: InlineStyle = {};

    public setProperty(key: string, value: any)
    {
        this.values[key] = value;
    }
    public removeProperty(key: string)
    {
    }

    public toString()
    {
        let result = '';
        for (const key in this.values)
        {
            const value = this.values[key];
            result += `${key}`;
            result += `:${escape(value)};`;
        }
        return result;
    }
}

interface Attributes
{
    [key: string]: string;
}

export class SSRDomClassList implements DomClassList
{
    public get length()
    {
        return this.classes.length;
    }

    public classes: string[] = [];

    item(index: number): string | null
    {
        return this.classes[index];
    }
    contains(className: string): boolean
    {
        return this.classes.includes(className);
    }
    add(className: string, ...classNames: string[]): void
    {
        this.classes.push(className);
        for (const c of classNames)
        {
            this.classes.push(c);
        }

    }
    remove(className: string, ...classNames: string[]): void
    {
        this.removeSingle(className);
        for (const c of classNames)
        {
            this.removeSingle(c);
        }
    }

    toggle(className: string, force?: boolean): boolean
    {
        const index = this.classes.indexOf(className);
        if (index >= 0)
        {
            if (force)
            {
                return true;
            }

            this.removeSingle(className);
            return false;
        }

        if (!force)
        {
            return false;
        }

        this.classes.push(className);
        return true;
    }

    private removeSingle(className: string)
    {
        let index = this.classes.indexOf(className);
        if (index >= 0)
        {
            this.classes.splice(index, 1);
        }
    }
}

export class SSRDomElement extends SSRDomNode implements DomElement
{
    public readonly nodeName: string
    public childNodes: SSRDomNodeList = new SSRDomNodeList();
    public style: SSRDomInlineStyle = new SSRDomInlineStyle();
    public classList: SSRDomClassList = new SSRDomClassList();

    constructor (nodeName: string, xmlns: string = '')
    {
        super();
        this.nodeName = nodeName;
        if (xmlns.length > 0)
        {
            this.attributes['xmlns'] = xmlns;
        }
    }

    private attributes: Attributes = {};

    [key: string]: any;

    public setAttribute(qualifiedName: string, value: string)
    {
        this.attributes[qualifiedName] = value;
    }
    public removeAttribute(qualifiedName: string)
    {
    }

    public addEventListener(type: any, listener: any, options?: any)
    {
        // Ignore
    }
    public removeEventListener(type: any, listener: any, options?: any)
    {
        // Ignore
    }

    public appendChild(node: any)
    {
        this.childNodes.nodes.push(node);
        return node;
    }

    public insertBefore(newNode: any, referenceNode: any)
    {
        return newNode;
    }

    public removeChild(node: any)
    {
    }

    public toString(forHydration: boolean, parentNode?: SSRDomNode, previousNode?: SSRDomNode)
    {
        let innerHtml = '';
        for (let i = 0; i < this.childNodes.nodes.length; i++)
        {
            const prevNode = i > 0 ? this.childNodes.nodes[i - 1] as SSRDomNode: undefined;
            const node = this.childNodes.nodes[i] as SSRDomNode;
            innerHtml += node.toString(forHydration, this, prevNode);
        }

        if (this.nodeName === 'EMPTY')
        {
            return innerHtml;
        }

        const openTag = `<${this.nodeName}${this.toStringAttributes(parentNode)}${this.toStringStyle()}`;

        if (innerHtml === '')
        {
            return `${openTag}/>`;
        }


        return `${openTag}>${innerHtml}</${this.nodeName}>`;
    }

    public toStringStyle()
    {
        const result = this.style.toString();
        if (result.length === 0)
        {
            return result;
        }

        return ` style="${result}"`;
    }

    public toStringAttributes(parentNode?: SSRDomNode)
    {
        let result = '';
        let className = '';
        for (const key in this.attributes)
        {
            const value = this.attributes[key];
            if (key === 'xmlns' &&
                parentNode instanceof SSRDomElement &&
                value === parentNode.attributes['xmlns'])
            {
                continue;
            }

            if (key === 'class')
            {
                className = quoteattr(value);
            }
            else
            {
                result += ` ${key}`;
                result += `="${quoteattr(value)}"`;
            }
        }

        if (this.classList.length > 0)
        {
            if (className.length > 0)
            {
                className += ' ';
            }
            className += this.classList.classes.join(' ');
        }

        if (className.length > 0)
        {
            result += ` class="${className}"`;
        }

        return result;
    }
}

export class SSRDomDocument implements DomDocument
{
    public static emptyElement()
    {
        return new SSRDomElement('EMPTY');
    }

    public createElement(type: string): SSRDomElement
    {
        return new SSRDomElement(type);
    }
    public createElementNS(namespace: string, type: string): SSRDomElement
    {
        return new SSRDomElement(type, namespace);
    }
    public createTextNode(text: string): SSRDomText
    {
        return new SSRDomText(text);
    }
}
