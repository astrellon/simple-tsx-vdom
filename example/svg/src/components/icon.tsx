import { vdom, FunctionalComponent, ClassComponent } from "../../../../src";
import './icon.scss';

export type IconType = 'info' | 'add';
interface Props
{
    readonly type: IconType;
    readonly size: number;
}

interface IconProps
{
    readonly size: number;
}

class InfoIcon extends ClassComponent<IconProps>
{
    public render()
    {
        const { size } = this.props;

        return <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
            <circle cy="12" cx="12" fill="none" stroke="#000" stroke-width="2" r="11" />
            <rect x="11" y="6" width="2" height="2" />
            <rect x="11" y="10" width="2" height="8" />
        </svg>;
    }
}

class AddIcon extends ClassComponent<IconProps>
{
    public render()
    {
        const { size } = this.props;

        return <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
            <circle cy="12" cx="12" fill="none" stroke="#000" stroke-width="2" r="11" />
            <rect x="6" y="11" width="12" height="2" />
            <rect x="11" y="6" width="2" height="12" />
        </svg>;
    }
}

export const Icon: FunctionalComponent = (props: Props) =>
{
    const { type, size } = props;
    switch (type)
    {
        case 'info': return <InfoIcon size={size} />;
        case 'add': return <AddIcon size={size} />;
        default: <span>Unknown icon type{props.type}</span>;
    }
}