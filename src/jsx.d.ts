declare namespace JSX
{
    // The IntrinsicElements interface is a special case that TypeScript
    // will look at for types when it comes to built in browser HTML elements.
    interface IntrinsicElements
    {
        // The HTMLDivElement, HTMLSpanElement, etc interfaces are
        // already defined in TypeScript and we are just reusing them.

        // The Partial interface sets that all the fields in the given
        // interface are now optional instead of required.

        // React and other frameworks sometimes create their own
        // interfaces to the HTML elements. For example with React
        // they use 'onClick' instead of 'onclick' because they
        // use their own layer of event handling.

        // HTML
        a: Partial<HTMLAnchorElement>;
        abbr: Partial<HTMLElement>;
        address: Partial<HTMLElement>;
        area: Partial<HTMLAreaElement>;
        article: Partial<HTMLElement>;
        aside: Partial<HTMLElement>;
        audio: Partial<HTMLAudioElement>;
        b: Partial<HTMLElement>;
        base: Partial<HTMLBaseElement>;
        bdi: Partial<HTMLElement>;
        bdo: Partial<HTMLElement>;
        big: Partial<HTMLElement>;
        blockquote: Partial<HTMLQuoteElement>;
        body: Partial<HTMLBodyElement>;
        br: Partial<HTMLBRElement>;
        button: Partial<HTMLButtonElement>;
        canvas: Partial<HTMLCanvasElement>;
        caption: Partial<HTMLTableCaptionElement>;
        cite: Partial<HTMLElement>;
        code: Partial<HTMLElement>;
        col: Partial<HTMLTableColElement>;
        colgroup: Partial<HTMLTableColElement>;
        data: Partial<HTMLDataElement>;
        datalist: Partial<HTMLDataListElement>;
        dd: Partial<HTMLElement>;
        del: Partial<HTMLModElement>;
        details: Partial<HTMLDetailsElement>;
        dfn: Partial<HTMLElement>;
        dialog: Partial<HTMLDialogElement>;
        div: Partial<HTMLDivElement>;
        dl: Partial<HTMLDListElement>;
        dt: Partial<HTMLElement>;
        em: Partial<HTMLElement>;
        embed: Partial<HTMLEmbedElement>;
        fieldset: Partial<HTMLFieldSetElement>;
        figcaption: Partial<HTMLElement>;
        figure: Partial<HTMLElement>;
        footer: Partial<HTMLElement>;
        form: Partial<HTMLFormElement>;
        h1: Partial<HTMLHeadingElement>;
        h2: Partial<HTMLHeadingElement>;
        h3: Partial<HTMLHeadingElement>;
        h4: Partial<HTMLHeadingElement>;
        h5: Partial<HTMLHeadingElement>;
        h6: Partial<HTMLHeadingElement>;
        head: Partial<HTMLHeadElement>;
        header: Partial<HTMLElement>;
        hgroup: Partial<HTMLElement>;
        hr: Partial<HTMLHRElement>;
        html: Partial<HTMLHtmlElement>;
        i: Partial<HTMLElement>;
        iframe: Partial<HTMLIFrameElement>;
        img: Partial<HTMLImageElement>;
        input: Partial<HTMLInputElement>;
        ins: Partial<HTMLModElement>;
        kbd: Partial<HTMLElement>;
        keygen: Partial<HTMLUnknownElement>;
        label: Partial<HTMLLabelElement>;
        legend: Partial<HTMLLegendElement>;
        li: Partial<HTMLLIElement>;
        link: Partial<HTMLLinkElement>;
        main: Partial<HTMLElement>;
        map: Partial<HTMLMapElement>;
        mark: Partial<HTMLElement>;
        marquee: Partial<HTMLMarqueeElement>;
        menu: Partial<HTMLMenuElement>;
        menuitem: Partial<HTMLUnknownElement>;
        meta: Partial<HTMLMetaElement>;
        meter: Partial<HTMLMeterElement>;
        nav: Partial<HTMLElement>;
        noscript: Partial<HTMLElement>;
        object: Partial<HTMLObjectElement>;
        ol: Partial<HTMLOListElement>;
        optgroup: Partial<HTMLOptGroupElement>;
        option: Partial<HTMLOptionElement>;
        output: Partial<HTMLOutputElement>;
        p: Partial<HTMLParagraphElement>;
        param: Partial<HTMLParamElement>;
        picture: Partial<HTMLPictureElement>;
        pre: Partial<HTMLPreElement>;
        progress: Partial<HTMLProgressElement>;
        q: Partial<HTMLQuoteElement>;
        rp: Partial<HTMLElement>;
        rt: Partial<HTMLElement>;
        ruby: Partial<HTMLElement>;
        s: Partial<HTMLElement>;
        samp: Partial<HTMLElement>;
        script: Partial<HTMLScriptElement>;
        section: Partial<HTMLElement>;
        select: Partial<HTMLSelectElement>;
        slot: Partial<HTMLSlotElement>;
        small: Partial<HTMLElement>;
        source: Partial<HTMLSourceElement>;
        span: Partial<HTMLSpanElement>;
        strong: Partial<HTMLElement>;
        style: Partial<HTMLStyleElement>;
        sub: Partial<HTMLElement>;
        summary: Partial<HTMLElement>;
        sup: Partial<HTMLElement>;
        table: Partial<HTMLTableElement>;
        tbody: Partial<HTMLTableSectionElement>;
        td: Partial<HTMLTableCellElement>;
        textarea: Partial<HTMLTextAreaElement>;
        tfoot: Partial<HTMLTableSectionElement>;
        th: Partial<HTMLTableCellElement>;
        thead: Partial<HTMLTableSectionElement>;
        time: Partial<HTMLTimeElement>;
        title: Partial<HTMLTitleElement>;
        tr: Partial<HTMLTableRowElement>;
        track: Partial<HTMLTrackElement>;
        u: Partial<HTMLElement>;
        ul: Partial<HTMLUListElement>;
        var: Partial<HTMLElement>;
        video: Partial<HTMLVideoElement>;
        wbr: Partial<HTMLElement>;

        //SVG
        svg: Partial<SVGSVGElement>;
        animate: Partial<SVGAnimateElement>;
        circle: Partial<SVGCircleElement>;
        animateTransform: Partial<SVGAnimateElement>;
        clipPath: Partial<SVGClipPathElement>;
        defs: Partial<SVGDefsElement>;
        desc: Partial<SVGDescElement>;
        ellipse: Partial<SVGEllipseElement>;
        feBlend: Partial<SVGFEBlendElement>;
        feColorMatrix: Partial<SVGFEColorMatrixElement>;
        feComponentTransfer: Partial<SVGFEComponentTransferElement>;
        feComposite: Partial<SVGFECompositeElement>;
        feConvolveMatrix: Partial<SVGFEConvolveMatrixElement>;
        feDiffuseLighting: Partial<SVGFEDiffuseLightingElement>;
        feDisplacementMap: Partial<SVGFEDisplacementMapElement>;
        feDropShadow: Partial<SVGFEDropShadowElement>;
        feFlood: Partial<SVGFEFloodElement>;
        feGaussianBlur: Partial<SVGFEGaussianBlurElement>;
        feImage: Partial<SVGFEImageElement>;
        feMerge: Partial<SVGFEMergeElement>;
        feMergeNode: Partial<SVGFEMergeNodeElement>;
        feMorphology: Partial<SVGFEMorphologyElement>;
        feOffset: Partial<SVGFEOffsetElement>;
        feSpecularLighting: Partial<SVGFESpecularLightingElement>;
        feTile: Partial<SVGFETileElement>;
        feTurbulence: Partial<SVGFETurbulenceElement>;
        filter: Partial<SVGFilterElement>;
        foreignObject: Partial<SVGForeignObjectElement>;
        g: Partial<SVGGElement>;
        image: Partial<SVGImageElement>;
        line: Partial<SVGLineElement>;
        linearGradient: Partial<SVGLinearGradientElement>;
        marker: Partial<SVGMarkerElement>;
        mask: Partial<SVGMaskElement>;
        path: Partial<SVGPathElement>;
        pattern: Partial<SVGPatternElement>;
        polygon: Partial<SVGPolygonElement>;
        polyline: Partial<SVGPolylineElement>;
        radialGradient: Partial<SVGRadialGradientElement>;
        rect: Partial<SVGRectElement>;
        stop: Partial<SVGStopElement>;
        symbol: Partial<SVGSymbolElement>;
        text: Partial<SVGTextElement>;
        tspan: Partial<SVGTSpanElement>;
        use: Partial<SVGUseElement>;
    }
}