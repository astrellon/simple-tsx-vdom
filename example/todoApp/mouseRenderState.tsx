import { vdom, ClassComponent } from "../../src";

interface Props
{
}

export class MouseRenderClassState extends ClassComponent<Props>
{
    x = 0;
    y = 0;

    onMount() {
        window.addEventListener('mousemove', this.onMouseMove)
    }
    onUnmount() {
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