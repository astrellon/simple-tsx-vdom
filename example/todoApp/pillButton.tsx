import { vdom, ClassComponent } from '../../src';
import './pillButton.scss';

interface Props
{
    readonly label?: string;
    readonly className?: string;
    readonly onClick?: () => void;
    readonly href?: string;
    readonly light?: boolean;
}

export default class PillButton extends ClassComponent<Props>
{
    public render()
    {
        const { className, onClick, light, href } = this.props;

        const combinedClassName = `pill-button ${className || ''} ${light ? 'light' : ''}`;

        if (href)
        {
            return <a target='_blank' href={href} class={combinedClassName} onclick={onClick}>
                { this.renderInternal() }
            </a>
        }

        return <button class={combinedClassName} onclick={onClick}>
            { this.renderInternal() }
        </button>
    }

    private renderInternal()
    {
        const { label } = this.props;

        return <span class='pill-button__label'>{label}</span>
    }
}