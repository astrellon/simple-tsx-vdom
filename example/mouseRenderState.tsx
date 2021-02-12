import { vdom, VDomComponent } from "../src";

interface Props
{
}

export class MouseRenderClassState extends VDomComponent<Props>
{
    x = 0;
    y = 0;

    componentDidMount() {
        window.addEventListener('mousemove', this.onMouseMove)
    }
    componentWillUnmount() {
        window.removeEventListener('mousemove', this.onMouseMove)
    }

    onMouseMove = (e: MouseEvent) => {
        this.x = e.clientX;
        this.y = e.clientY;
        this.forceUpdate();
    }

    public render()
    {
        return <span>
            Class State Mouse X: {this.x} Mouse Y: {this.y}
        </span>
    }
}