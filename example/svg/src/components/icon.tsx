import { vdom, FunctionalComponent } from "../../../../src";
import './icon.scss';

export type IconType = 'info' | 'add';
interface Props
{
    readonly type: IconType;
}

const infoIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
        <circle cy="12" cx="12" fill="none" stroke="#000" stroke-width="2" r="11" />
        <rect x="11" y="6" width="2" height="2" />
        <rect x="11" y="10" width="2" height="8" />
    </svg>;

const addIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
        <circle cy="12" cx="12" fill="none" stroke="#000" stroke-width="2" r="11" />
        <rect x="6" y="11" width="12" height="2" />
        <rect x="11" y="6" width="2" height="12" />
    </svg>;

export const Icon: FunctionalComponent = (props: Props) =>
{
    switch (props.type)
    {
        case 'info': return infoIcon;
        case 'add': return addIcon;
        default: <span>Unknown icon type{props.type}</span>;
    }
}