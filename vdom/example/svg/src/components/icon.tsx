import { vdom, ClassComponent } from "../../../../src";

export type IconType = 'info' | 'add';
interface Props
{
    readonly type: IconType;
    readonly size: number;
}

const infoIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <circle cy="12" cx="12" fill="none" stroke="#000" stroke-width="2" r="11" />
    <rect x="11" y="6" width="2" height="2" />
    <rect x="11" y="10" width="2" height="8" />
</svg>;

const addIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <circle cy="12" cx="12" fill="none" stroke="#000" stroke-width="2" r="11" />
    <rect x="6" y="11" width="12" height="2" />
    <rect x="11" y="6" width="2" height="12" />
</svg>;

function chooseIcon(type: IconType)
{
    switch (type)
    {
        case 'info': return infoIcon;
        case 'add': return addIcon;
        default: return <span>Unknown icon type{type}</span>;
    }
}

export class Icon extends ClassComponent<Props>
{
    public render()
    {
        const { type, size } = this.props;

        const style: Partial<CSSStyleDeclaration> =
        {
            width: size + 'px',
            height: size + 'px'
        }

        return <div class='icon' style={style}>
            {chooseIcon(type)}
        </div>
    }
}
