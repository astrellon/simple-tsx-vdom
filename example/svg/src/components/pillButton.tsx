import { vdom, FunctionalComponent } from '../../../../src';
import { Icon, IconType } from './icon';
import './pillButton.scss';

interface Props
{
    readonly label?: string;
    readonly class?: string;
    readonly onclick?: (e: MouseEvent) => void;
    readonly icon?: IconType;
}

export const PillButton:FunctionalComponent<Props> = (props: Props) =>
{
    const { icon, onclick, label } = props;

    const combinedClassName = `pill-button ${props.class || ''}`;

    return <button class={combinedClassName} onclick={onclick}>
        { icon && <Icon size={20} type={icon} /> }
        <span class='pill-button__label'>{label}</span>
    </button>
}