import { vdom, FunctionalComponent } from '../../src';
import './buttonGroup.scss';

interface Props
{
    readonly class?: string;
}

export const ButtonGroup: FunctionalComponent<Props> = (props, children) =>
    <div class={`button-group ${props.class || ''}`}>
        { children }
    </div>