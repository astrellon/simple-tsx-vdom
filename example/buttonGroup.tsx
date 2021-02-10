import { vdom, RenderNode } from '../src';
import './buttonGroup.scss';

interface Props
{
    readonly class?: string;
}

export const ButtonGroup: RenderNode<Props> = (props, children) =>
    <div class={`button-group ${props.class || ''}`}>
        { children }
    </div>